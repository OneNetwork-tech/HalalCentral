import { Repository } from "typeorm";
import { Vendor, VendorType, CuisineType } from "../models/vendor";
import QRCode from "qrcode";

interface VendorFilters {
  vendor_type?: VendorType;
  cuisine_type?: CuisineType;
  city?: string;
  postal_code?: string;
  accepts_online_orders?: boolean;
  offers_delivery?: boolean;
  is_open_now?: boolean;
  search?: string;
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
}

interface PaginationOptions {
  page: number;
  limit: number;
  filters?: VendorFilters;
}

interface VendorListResult {
  vendors: Vendor[];
  total: number;
  page: number;
  limit: number;
}

export class VendorService {
  private vendorRepository: Repository<Vendor>;

  constructor({ vendorRepository }: { vendorRepository: Repository<Vendor> }) {
    this.vendorRepository = vendorRepository;
  }

  async listVendors(options: PaginationOptions): Promise<VendorListResult> {
    const { page, limit, filters = {} } = options;
    const skip = (page - 1) * limit;

    let queryBuilder = this.vendorRepository
      .createQueryBuilder("vendor")
      .where("vendor.active = :active", { active: true });

    // Apply filters
    if (filters.vendor_type) {
      queryBuilder.andWhere("vendor.vendor_type = :vendor_type", { 
        vendor_type: filters.vendor_type 
      });
    }

    if (filters.cuisine_type) {
      queryBuilder.andWhere("vendor.cuisine_type = :cuisine_type", { 
        cuisine_type: filters.cuisine_type 
      });
    }

    if (filters.city) {
      queryBuilder.andWhere("vendor.address->>'city' ILIKE :city", { 
        city: `%${filters.city}%` 
      });
    }

    if (filters.postal_code) {
      queryBuilder.andWhere("vendor.address->>'postal_code' = :postal_code", { 
        postal_code: filters.postal_code 
      });
    }

    if (filters.accepts_online_orders) {
      queryBuilder.andWhere("vendor.accepts_online_orders = :accepts_online_orders", { 
        accepts_online_orders: filters.accepts_online_orders 
      });
    }

    if (filters.offers_delivery) {
      queryBuilder.andWhere("vendor.offers_delivery = :offers_delivery", { 
        offers_delivery: filters.offers_delivery 
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        "(vendor.name->>'sv' ILIKE :search OR vendor.name->>'en' ILIKE :search OR vendor.description->>'sv' ILIKE :search OR vendor.description->>'en' ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    // Location-based filtering
    if (filters.location) {
      const { lat, lng, radius } = filters.location;
      queryBuilder.andWhere(
        `ST_DWithin(
          ST_SetSRID(ST_MakePoint((vendor.address->>'coordinates')::json->>'lng', (vendor.address->>'coordinates')::json->>'lat'), 4326)::geography,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
          :radius * 1000
        )`,
        { lat, lng, radius }
      );
    }

    // Order by featured first, then by rating
    queryBuilder
      .orderBy("vendor.is_featured", "DESC")
      .addOrderBy("vendor.average_rating", "DESC")
      .addOrderBy("vendor.created_at", "DESC");

    const [vendors, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      vendors,
      total,
      page,
      limit
    };
  }

  async getVendor(id: string): Promise<Vendor | null> {
    return await this.vendorRepository.findOne({
      where: { id, active: true }
    });
  }

  async createVendor(vendorData: Partial<Vendor>): Promise<Vendor> {
    const vendor = this.vendorRepository.create(vendorData);
    return await this.vendorRepository.save(vendor);
  }

  async updateVendor(id: string, updateData: Partial<Vendor>): Promise<Vendor | null> {
    await this.vendorRepository.update(id, updateData);
    return await this.getVendor(id);
  }

  async deleteVendor(id: string): Promise<void> {
    await this.vendorRepository.update(id, { active: false });
  }

  async getVendorMenu(id: string, language: string = 'sv'): Promise<any[] | null> {
    const vendor = await this.getVendor(id);
    if (!vendor || !vendor.menu_items) return null;

    return vendor.menu_items[language] || vendor.menu_items['sv'] || vendor.menu_items['en'] || [];
  }

  async generateQRCode(vendorId: string): Promise<string> {
    const vendor = await this.getVendor(vendorId);
    if (!vendor) throw new Error("Vendor not found");

    const menuUrl = `${process.env.STORE_CORS}/menu/${vendorId}`;
    
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // In a real implementation, you would save this to file storage
      // For now, we'll just update the vendor record with the data URL
      await this.vendorRepository.update(vendorId, { 
        qr_code_url: qrCodeDataUrl 
      });

      return qrCodeDataUrl;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  async searchByLocation(
    lat: number, 
    lng: number, 
    radius: number = 10, 
    filters: Partial<VendorFilters> = {}
  ): Promise<Vendor[]> {
    const locationFilters = { ...filters, location: { lat, lng, radius } };
    const result = await this.listVendors({
      page: 1,
      limit: 50,
      filters: locationFilters
    });

    return result.vendors;
  }

  async getFeaturedVendors(limit: number = 10): Promise<Vendor[]> {
    return await this.vendorRepository.find({
      where: { 
        active: true, 
        is_featured: true 
      },
      order: { 
        average_rating: "DESC",
        total_reviews: "DESC" 
      },
      take: limit
    });
  }

  async updateCommissionTracking(vendorId: string, orderAmount: number): Promise<void> {
    const vendor = await this.getVendor(vendorId);
    if (!vendor) throw new Error("Vendor not found");

    const commission = vendor.calculateCommission(orderAmount);
    
    await this.vendorRepository.update(vendorId, {
      total_sales: vendor.total_sales + orderAmount,
      total_commission: vendor.total_commission + commission
    });
  }

  async getVendorsByType(vendorType: VendorType, limit: number = 20): Promise<Vendor[]> {
    return await this.vendorRepository.find({
      where: { 
        active: true, 
        vendor_type: vendorType 
      },
      order: { 
        average_rating: "DESC" 
      },
      take: limit
    });
  }

  async getVendorsByCuisine(cuisineType: CuisineType, limit: number = 20): Promise<Vendor[]> {
    return await this.vendorRepository.find({
      where: { 
        active: true, 
        cuisine_type: cuisineType 
      },
      order: { 
        average_rating: "DESC" 
      },
      take: limit
    });
  }

  async getVendorsWithDelivery(postalCode?: string): Promise<Vendor[]> {
    let queryBuilder = this.vendorRepository
      .createQueryBuilder("vendor")
      .where("vendor.active = :active", { active: true })
      .andWhere("vendor.offers_delivery = :offers_delivery", { offers_delivery: true });

    if (postalCode) {
      queryBuilder.andWhere(
        "vendor.delivery_areas->>'postal_codes' @> :postal_code",
        { postal_code: JSON.stringify([postalCode]) }
      );
    }

    return await queryBuilder
      .orderBy("vendor.average_rating", "DESC")
      .getMany();
  }

  async updateBusinessMetrics(vendorId: string): Promise<void> {
    // This would typically be called by a scheduled job
    // to update business metrics based on order data
    const vendor = await this.getVendor(vendorId);
    if (!vendor) return;

    // Calculate metrics from order data (placeholder implementation)
    const metrics = {
      monthly_orders: 0, // Calculate from orders
      monthly_revenue: 0, // Calculate from orders
      customer_retention_rate: 0, // Calculate from customer data
      average_order_value: 0, // Calculate from orders
      peak_hours: [], // Calculate from order timestamps
      popular_items: [] // Calculate from order items
    };

    await this.vendorRepository.update(vendorId, {
      business_metrics: metrics
    });
  }

  async getOpenVendors(): Promise<Vendor[]> {
    const vendors = await this.vendorRepository.find({
      where: { active: true }
    });

    // Filter by business hours (this would be more efficient with a database query)
    return vendors.filter(vendor => vendor.is_open_now);
  }

  async claimVendor(vendorId: string, userId: string): Promise<boolean> {
    // Implementation for business owner claiming their listing
    // This would involve verification process
    const vendor = await this.getVendor(vendorId);
    if (!vendor) return false;

    // Add claim request logic here
    // For now, just mark as verified if not already claimed
    if (!vendor.verified) {
      await this.vendorRepository.update(vendorId, {
        verified: true
        // owner_id: userId // This would be added to the entity
      });
      return true;
    }

    return false;
  }
}
