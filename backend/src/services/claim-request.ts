
import { Lifetime } from "awilix"
import { BaseService } from "medusa-interfaces"
import { ClaimRequest } from "../models/claim-request"

class ClaimRequestService extends BaseService {
  static LIFE_TIME = Lifetime.SCOPED
  protected readonly claimRequestRepository_: typeof ClaimRequest

  constructor(container) {
    super(container)
    this.claimRequestRepository_ = container.claimRequestRepository
  }

  async list() {
    return await this.claimRequestRepository_.find()
  }

  async findById(id) {
    return await this.claimRequestRepository_.findOne(id)
  }

  async create(data) {
    return await this.claimRequestRepository_.create(data)
  }

  async update(id, data) {
    return await this.claimRequestRepository_.update(id, data)
  }

  async delete(id) {
    return await this.claimRequestRepository_.delete(id)
  }
}

export default ClaimRequestService
