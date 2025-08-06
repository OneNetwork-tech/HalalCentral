import { EntityRepository, Repository } from "typeorm"
import { Vendor } from "../models/vendor"

@EntityRepository(Vendor)
export class VendorRepository extends Repository<Vendor> {
  async findByType(vendorType: string): Promise<Vendor[]> {
    return this.find({ where: { business_type: vendorType, is_active: true } })
  }

  async findActive(): Promise<Vendor[]> {
    return this.find({ where: { is_active: true } })
  }

  async searchByName(query: string): Promise<Vendor[]> {
    return this.createQueryBuilder("vendor")
      .where("vendor.name ILIKE :query", { query: `%${query}%` })
      .andWhere("vendor.is_active = :active", { active: true })
      .getMany()
  }
}