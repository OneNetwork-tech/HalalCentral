import { EntityRepository, Repository } from "typeorm"
import { Institute } from "../models/institute"

@EntityRepository(Institute)
export class InstituteRepository extends Repository<Institute> {
  async findByType(instituteType: string): Promise<Institute[]> {
    return this.find({ where: { institute_type: instituteType, is_active: true } })
  }

  async findActive(): Promise<Institute[]> {
    return this.find({ where: { is_active: true } })
  }

  async searchByName(query: string): Promise<Institute[]> {
    return this.createQueryBuilder("institute")
      .where("institute.name ILIKE :query", { query: `%${query}%` })
      .andWhere("institute.is_active = :active", { active: true })
      .getMany()
  }
}