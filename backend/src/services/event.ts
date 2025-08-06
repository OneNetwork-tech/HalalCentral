
import { Lifetime } from "awilix"
import { BaseService } from "medusa-interfaces"
import { Event } from "../models/event"

class EventService extends BaseService {
  static LIFE_TIME = Lifetime.SCOPED
  protected readonly eventRepository_: typeof Event

  constructor(container) {
    super(container)
    this.eventRepository_ = container.eventRepository
  }

  async list() {
    return await this.eventRepository_.find()
  }

  async findById(id) {
    return await this.eventRepository_.findOne(id)
  }

  async create(data) {
    return await this.eventRepository_.create(data)
  }

  async update(id, data) {
    return await this.eventRepository_.update(id, data)
  }

  async delete(id) {
    return await this.eventRepository_.delete(id)
  }
}

export default EventService
