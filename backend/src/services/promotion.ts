
import { Lifetime } from "awilix"
import { BaseService } from "medusa-interfaces"
import { Promotion } from "../models/promotion"

class PromotionService extends BaseService {
  static LIFE_TIME = Lifetime.SCOPED
  protected readonly promotionRepository_: typeof Promotion

  constructor(container) {
    super(container)
    this.promotionRepository_ = container.promotionRepository
  }

  async list() {
    return await this.promotionRepository_.find()
  }

  async findById(id) {
    return await this.promotionRepository_.findOne(id)
  }

  async create(data) {
    return await this.promotionRepository_.create(data)
  }

  async update(id, data) {
    return await this.promotionRepository_.update(id, data)
  }

  async delete(id) {
    return await this.promotionRepository_.delete(id)
  }
}

export default PromotionService
