
import { BaseEntity } from "@medusajs/medusa"
import { Entity, Column, ManyToOne } from "typeorm"
import { Product } from "@medusajs/medusa/dist/models"
import { Vendor } from "./vendor"
import { Institute } from "./institute"
import { Event } from "./event"

@Entity()
export class Promotion extends BaseEntity {
  @Column({ type: "varchar" })
  type: string // e.g., featured_product, featured_listing, promoted_event

  @ManyToOne(() => Product)
  product: Product

  @ManyToOne(() => Vendor)
  vendor: Vendor

  @ManyToOne(() => Institute)
  institute: Institute

  @ManyToOne(() => Event)
  event: Event

  @Column({ type: "timestamp" })
  start_date: Date

  @Column({ type: "timestamp" })
  end_date: Date
}
