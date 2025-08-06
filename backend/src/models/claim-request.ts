
import { BaseEntity } from "@medusajs/medusa"
import { Entity, Column, ManyToOne } from "typeorm"
import { User } from "@medusajs/medusa/dist/models"
import { Vendor } from "./vendor"
import { Institute } from "./institute"

@Entity()
export class ClaimRequest extends BaseEntity {
  @ManyToOne(() => User)
  user: User

  @ManyToOne(() => Vendor)
  vendor: Vendor

  @ManyToOne(() => Institute)
  institute: Institute

  @Column({ type: "varchar" })
  status: string // e.g., pending, approved, rejected
}
