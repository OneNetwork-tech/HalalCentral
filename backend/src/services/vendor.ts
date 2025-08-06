import { Lifetime } from "awilix"
import { BaseService } from "medusa-interfaces"
import { Vendor } from "../models/vendor"
import { VendorRepository } from "../repositories/vendor"

class VendorService extends BaseService {
  static LIFE_TIME = Lifetime.SCOPED
  protected readonly vendorRepository_: VendorRepository

  constructor(container: any) {
    super(container)
    this.vendorRepository_ = container.vendorRepository
  }

  async list() {
    return await this.vendorRepository_.findActive()
  }

  async findById(id: string) {
    return await this.vendorRepository_.findOne({ where: { id, is_active: true } })
  }

  async findByType(type: string) {
    return await this.vendorRepository_.findByType(type)
  }

  async create(data: any) {
    const vendor = this.vendorRepository_.create(data)
    return await this.vendorRepository_.save(vendor)
  }

  async update(id: string, data: any) {
    return await this.vendorRepository_.update(id, data)
  }

  async delete(id: string) {
    return await this.vendorRepository_.update(id, { is_active: false })
  }

  async search(query: string) {
    return await this.vendorRepository_.searchByName(query)
  }
}

export default VendorService