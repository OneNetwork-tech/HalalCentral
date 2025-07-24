import { Entity, Column, Index, PrimaryGeneratedColumn } from "typeorm";
import { BaseBusinessEntity } from "./base-business-entity";

export enum VendorType {
  RESTAURANT = "restaurant",
  GROCERY = "grocery", 
  BUTCHER = "butcher",
  BAKERY = "bakery",
  PHARMACY = "pharmacy",
  CLOTHING = "clothing",
  BOOKSTORE = "bookstore",
  OTHER = "other"
}

export enum CuisineType {
  MIDDLE_EASTERN = "middle_eastern",
  SOUTH_ASIAN = "south_asian",
  NORTH_AFRICAN = "north_african",
  TURKISH = "turkish",
  PERSIAN = "persian",
  MALAYSIAN = "malaysian",
  INTERNATIONAL = "international",
  SWEDISH_HALAL = "swedish_halal"
}

@Entity()
export class Vendor extends BaseBusinessEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column({ type: "enum", enum: VendorType })
  @Index()
  vendor_type: VendorType;

  @Column({ type: "enum", enum: CuisineType, nullable: true })
  @Index()
  cuisine_type?: CuisineType;

  @Column({ type: "jsonb", nullable: true })
  menu_items?: {
    [language: string]: Array<{
      id: string;
      name: string;
      description?: string;
      price: number;
      category: string;
      allergens?: string[];
      dietary_info?: string[];
      image_url?: string;
      available: boolean;
    }>;
  };

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  commission_rate: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  total_sales: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  total_commission: number;

  @Column({ type: "boolean", default: false })
  @Index()
  accepts_online_orders: boolean;

  @Column({ type: "boolean", default: false })
  @Index()
  offers_delivery: boolean;

  @Column({ type: "boolean", default: false })
  @Index()
  offers_pickup: boolean;

  @Column({ type: "decimal", precision: 8, scale: 2, nullable: true })
  delivery_fee?: number;

  @Column({ type: "decimal", precision: 8, scale: 2, nullable: true })
  minimum_order?: number;

  @Column({ type: "integer", nullable: true })
  delivery_time_minutes?: number;

  @Column({ type: "jsonb", nullable: true })
  delivery_areas?: {
    postal_codes: string[];
    radius_km?: number;
  };

  @Column({ type: "text", nullable: true })
  qr_code_url?: string;

  @Column({ type: "jsonb", nullable: true })
  payment_methods?: {
    swish: boolean;
    card: boolean;
    cash: boolean;
    invoice: boolean;
  };

  @Column({ type: "jsonb", nullable: true })
  social_media?: {
    facebook?: string;
    instagram?: string;
    website?: string;
    google_business?: string;
  };

  // Note: average_rating and total_reviews are inherited from BaseBusinessEntity

  @Column({ type: "jsonb", nullable: true })
  special_offers?: Array<{
    id: string;
    title: { [language: string]: string };
    description: { [language: string]: string };
    discount_percentage?: number;
    discount_amount?: number;
    valid_from: Date;
    valid_until: Date;
    conditions?: string;
    active: boolean;
  }>;

  @Column({ type: "boolean", default: false })
  @Index()
  is_featured: boolean;

  @Column({ type: "timestamp", nullable: true })
  featured_until?: Date;

  @Column({ type: "jsonb", nullable: true })
  business_metrics?: {
    monthly_orders: number;
    monthly_revenue: number;
    customer_retention_rate: number;
    average_order_value: number;
    peak_hours: string[];
    popular_items: string[];
  };

  // Swedish-specific business information
  @Column({ type: "text", nullable: true })
  f_tax_number?: string; // F-skattsedel number

  @Column({ type: "boolean", default: false })
  has_alcohol_license: boolean;

  @Column({ type: "jsonb", nullable: true })
  swedish_certifications?: {
    livsmedelsverket: boolean; // Swedish Food Agency
    halal_certification_body: string;
    organic_certification: boolean;
    fairtrade_certification: boolean;
  };

  // Calculated fields
  get is_open_now(): boolean {
    if (!this.business_hours) return false;
    
    const now = new Date();
    const currentDay = now.toLocaleDateString('sv-SE', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toLocaleTimeString('sv-SE', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    const todayHours = this.business_hours[currentDay];
    if (!todayHours || todayHours.closed) return false;
    
    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  }

  get display_name(): string {
    const locale = 'sv'; // Default to Swedish
    return this.name?.[locale] || this.name?.['en'] || Object.values(this.name || {})[0] || 'Unnamed Business';
  }

  get formatted_address(): string {
    if (!this.address) return '';
    
    const parts = [
      this.address.street,
      this.address.postal_code ? `${this.address.postal_code.slice(0, 3)} ${this.address.postal_code.slice(3)}` : '',
      this.address.city?.toUpperCase(),
      this.address.county
    ].filter(Boolean);
    
    return parts.join('\n');
  }

  // Business logic methods
  calculateCommission(orderAmount: number): number {
    return orderAmount * (this.commission_rate / 100);
  }

  isDeliveryAvailable(postalCode: string): boolean {
    if (!this.offers_delivery || !this.delivery_areas) return false;
    return this.delivery_areas.postal_codes.includes(postalCode);
  }

  getEstimatedDeliveryTime(): string {
    if (!this.delivery_time_minutes) return 'Not specified';
    
    const minutes = this.delivery_time_minutes;
    if (minutes < 60) return `${minutes} minuter`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) return `${hours} timme${hours > 1 ? 'r' : ''}`;
    return `${hours} timme${hours > 1 ? 'r' : ''} ${remainingMinutes} minuter`;
  }
}
