import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"
import { BaseBusinessEntity } from "./base-business-entity"

@Entity()
export class Vendor extends BaseBusinessEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "varchar" })
  business_type!: string // e.g., restaurant, grocery, etc.

  @Column({ type: "jsonb", nullable: true })
  opening_hours: any

  @Column({ type: "varchar", nullable: true })
  halal_certification!: string

  @Column({ type: "boolean", default: false })
  is_active!: boolean

  @Column({ type: "decimal", precision: 3, scale: 2, default: 0 })
  commission_rate!: number

  @Column({ type: "jsonb", nullable: true })
  cuisine_types!: string[]

  @Column({ type: "jsonb", nullable: true })
  dietary_options!: {
    halal: boolean
    vegetarian: boolean
    vegan: boolean
    gluten_free: boolean
  }

  @Column({ type: "boolean", default: false })
  delivery_available!: boolean

  @Column({ type: "boolean", default: false })
  takeaway_available!: boolean

  @Column({ type: "boolean", default: false })
  qr_ordering_enabled!: boolean
}