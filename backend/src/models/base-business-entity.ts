import { BaseEntity } from "@medusajs/medusa"
import { Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

export abstract class BaseBusinessEntity extends BaseEntity {
  @Column({ type: "jsonb" })
  name!: {
    sv: string
    en: string
    ar: string
  }

  @Column({ type: "jsonb" })
  description!: {
    sv: string
    en: string
    ar: string
  }

  @Column({ type: "jsonb" })
  address!: {
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
  contact_info!: {
    phone: string
    email: string
    website?: string
    social_media?: {
      facebook?: string
      instagram?: string
      twitter?: string
    }
  }

  @Column({ type: "boolean", default: false })
  is_verified!: boolean

  @Column({ type: "boolean", default: true })
  is_active!: boolean

  @Column({ type: "jsonb", nullable: true })
  business_hours!: {
    [key: string]: {
      open: string
      close: string
      closed?: boolean
    }
  }

  @Column({ type: "jsonb", nullable: true })
  certifications!: {
    halal_cert?: {
      issuer: string
      valid_until: Date
      certificate_url?: string
    }
    business_license?: {
      number: string
      valid_until: Date
    }
  }

  @Column({ type: "varchar", nullable: true })
  organization_number!: string

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date
}