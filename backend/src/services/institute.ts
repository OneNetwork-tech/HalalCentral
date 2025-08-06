import { Lifetime } from "awilix"
import { BaseService } from "medusa-interfaces"
import { Institute } from "../models/institute"
import { InstituteRepository } from "../repositories/institute"

class InstituteService extends BaseService {
  static LIFE_TIME = Lifetime.SCOPED
  protected readonly instituteRepository_: InstituteRepository

  constructor(container: any) {
    super(container)
    this.instituteRepository_ = container.instituteRepository
  }

  async list() {
    return await this.instituteRepository_.findActive()
  }

  async findById(id: string) {
    return await this.instituteRepository_.findOne({ where: { id, is_active: true } })
  }

  async findByType(type: string) {
    return await this.instituteRepository_.findByType(type)
  }

  async create(data: any) {
    const institute = this.instituteRepository_.create(data)
    return await this.instituteRepository_.save(institute)
  }

  async update(id: string, data: any) {
    return await this.instituteRepository_.update(id, data)
  }

  async delete(id: string) {
    return await this.instituteRepository_.update(id, { is_active: false })
  }

  async search(query: string) {
    return await this.instituteRepository_.searchByName(query)
  }
}

export default InstituteService