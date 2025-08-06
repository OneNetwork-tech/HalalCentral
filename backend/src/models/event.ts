
import { BaseEntity } from "@medusajs/medusa"
import { Entity, Column, ManyToOne } from "typeorm"
import { Vendor } from "./vendor"
import { Institute } from "./institute"

@Entity()
export class Event extends BaseEntity {
  @Column({ type: "varchar" })
  title: string

  @Column({ type: "varchar" })
  description: string

  @Column({ type: "timestamp" })
  date: Date

  @Column({ type: "varchar" })
  location: string

  @ManyToOne(() => Vendor)
  vendor: Vendor

  @ManyToOne(() => Institute)
  institute: Institute
}
