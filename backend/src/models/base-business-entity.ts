import { BaseEntity, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

export abstract class BaseBusinessEntity extends BaseEntity {
  @Column({ type: "jsonb" })
  @Index("idx_business_name_gin", { synchronize: false })
  name: {
    en: string
    sv: string
    ar: string
  }

  @Column({ type: "jsonb" })
  description: {
    en: string
    sv: string
    ar: string
  }

  @Column({ type: "jsonb" })
  @Index("idx_business_address_gin", { synchronize: false })
  address: {
    street: string
    city: string
    postal_code: string
    county: string
    country: string
    coordinates?: {
      lat: number
      lng: number
    }
  }

  @Column({ type: "jsonb" })
  contact_info: {
    phone: string
    email: string
    website?: string
    social_media?: {
      facebook?: string
      instagram?: string
      twitter?: string
      linkedin?: string
    }
  }

  @Column({ default: false })
  @Index("idx_business_verified")
  verified: boolean

  @Column({ default: true })
  @Index("idx_business_active")
  active: boolean

  @Column({ type: "jsonb", nullable: true })
  business_hours: {
    monday?: { open: string; close: string; closed?: boolean }
    tuesday?: { open: string; close: string; closed?: boolean }
    wednesday?: { open: string; close: string; closed?: boolean }
    thursday?: { open: string; close: string; closed?: boolean }
    friday?: { open: string; close: string; closed?: boolean }
    saturday?: { open: string; close: string; closed?: boolean }
    sunday?: { open: string; close: string; closed?: boolean }
  }

  @Column({ type: "jsonb", nullable: true })
  certifications: {
    halal_cert?: {
      issuer: string
      valid_until: Date
      certificate_url?: string
      verified: boolean
    }
    business_license?: {
      number: string
      valid_until: Date
      issuer: string
    }
    organization_number?: {
      number: string
      verified: boolean
      verified_at?: Date
    }
  }

  @Column({ type: "jsonb", nullable: true })
  images: {
    logo?: string
    cover?: string
    gallery?: string[]
  }

  @Column({ type: "jsonb", nullable: true })
  seo_data: {
    meta_title?: {
      en?: string
      sv?: string
      ar?: string
    }
    meta_description?: {
      en?: string
      sv?: string
      ar?: string
    }
    slug: {
      en: string
      sv: string
      ar: string
    }
  }

  @Column({ type: "decimal", precision: 2, scale: 1, default: 0 })
  @Index("idx_business_rating")
  average_rating: number

  @Column({ default: 0 })
  total_reviews: number

  @Column({ type: "jsonb", nullable: true })
  swedish_specific: {
    kommun?: string
    lan?: string
    postal_area?: string
    tax_registration?: {
      vat_number?: string
      f_tax_registered?: boolean
    }
  }

  @Column({ type: "jsonb", nullable: true })
  accessibility: {
    wheelchair_accessible?: boolean
    parking_available?: boolean
    public_transport_nearby?: boolean
    prayer_facilities?: boolean
  }

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  // Virtual fields for computed properties
  get is_open_now(): boolean {
    if (!this.business_hours) return false
    
    const now = new Date()
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const currentDay = dayNames[now.getDay()] as keyof typeof this.business_hours
    const currentTime = now.toLocaleTimeString('sv-SE', { hour12: false, hour: '2-digit', minute: '2-digit' })
    
    const todayHours = this.business_hours[currentDay]
    if (!todayHours || todayHours.closed) return false
    
    return currentTime >= todayHours.open && currentTime <= todayHours.close
  }

  get localized_name(): string {
    // Return name based on current locale context
    // This would be set by middleware or service context
    const locale = 'sv' // Default to Swedish
    return this.name[locale] || this.name.en || this.name.sv
  }

  get distance_from_user(): number | null {
    // This would be calculated dynamically based on user location
    // Placeholder for distance calculation
    return null
  }
}
