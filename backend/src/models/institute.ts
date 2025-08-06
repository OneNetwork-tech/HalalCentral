import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"
import { BaseBusinessEntity } from "./base-business-entity"

@Entity()
export class Institute extends BaseBusinessEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "varchar" })
  institute_type!: string // e.g., mosque, school, etc.

  @Column({ type: "jsonb", nullable: true })
  prayer_schedule: any

  @Column({ type: "varchar", nullable: true })
  donation_link!: string

  @Column({ type: "integer", default: 0 })
  capacity!: number

  @Column({ type: "boolean", default: false })
  is_active!: boolean

  @Column({ type: "jsonb", nullable: true })
  services!: {
    prayer_times?: boolean
    friday_prayers?: boolean
    educational_programs?: boolean
    community_events?: boolean
    marriage_services?: boolean
    funeral_services?: boolean
    counseling?: boolean
  }
}