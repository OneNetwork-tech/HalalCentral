import { Repository } from "typeorm";
import { Institute, InstituteType, PrayerMethod } from "../models/institute";

interface InstituteFilters {
  institute_type?: InstituteType;
  city?: string;
  postal_code?: string;
  accepts_donations?: boolean;
  has_friday_prayer?: boolean;
  search?: string;
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
}

interface PaginationOptions {
  page: number;
  limit: number;
  filters?: InstituteFilters;
}

interface InstituteListResult {
  institutes: Institute[];
  total: number;
  page: number;
  limit: number;
}

interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
  method: string;
}

export class InstituteService {
  private instituteRepository: Repository<Institute>;

  constructor({ instituteRepository }: { instituteRepository: Repository<Institute> }) {
    this.instituteRepository = instituteRepository;
  }

  async listInstitutes(options: PaginationOptions): Promise<InstituteListResult> {
    const { page, limit, filters = {} } = options;
    const skip = (page - 1) * limit;

    let queryBuilder = this.instituteRepository
      .createQueryBuilder("institute")
      .where("institute.active = :active", { active: true });

    // Apply filters
    if (filters.institute_type) {
      queryBuilder.andWhere("institute.institute_type = :institute_type", { 
        institute_type: filters.institute_type 
      });
    }

    if (filters.city) {
      queryBuilder.andWhere("institute.address->>'city' ILIKE :city", { 
        city: `%${filters.city}%` 
      });
    }

    if (filters.postal_code) {
      queryBuilder.andWhere("institute.address->>'postal_code' = :postal_code", { 
        postal_code: filters.postal_code 
      });
    }

    if (filters.accepts_donations) {
      queryBuilder.andWhere("institute.donation_info->>'accepts_donations' = :accepts_donations", { 
        accepts_donations: 'true' 
      });
    }

    if (filters.has_friday_prayer) {
      queryBuilder.andWhere("institute.friday_prayer IS NOT NULL");
    }

    if (filters.search) {
      queryBuilder.andWhere(
        "(institute.name->>'sv' ILIKE :search OR institute.name->>'en' ILIKE :search OR institute.description->>'sv' ILIKE :search OR institute.description->>'en' ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    // Location-based filtering
    if (filters.location) {
      const { lat, lng, radius } = filters.location;
      queryBuilder.andWhere(
        `ST_DWithin(
          ST_SetSRID(ST_MakePoint((institute.address->>'coordinates')::json->>'lng', (institute.address->>'coordinates')::json->>'lat'), 4326)::geography,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
          :radius * 1000
        )`,
        { lat, lng, radius }
      );
    }

    // Order by verified first, then by rating
    queryBuilder
      .orderBy("institute.verified", "DESC")
      .addOrderBy("institute.average_rating", "DESC")
      .addOrderBy("institute.created_at", "DESC");

    const [institutes, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      institutes,
      total,
      page,
      limit
    };
  }

  async getInstitute(id: string): Promise<Institute | null> {
    return await this.instituteRepository.findOne({
      where: { id, active: true }
    });
  }

  async createInstitute(instituteData: Partial<Institute>): Promise<Institute> {
    const institute = this.instituteRepository.create(instituteData);
    return await this.instituteRepository.save(institute);
  }

  async updateInstitute(id: string, updateData: Partial<Institute>): Promise<Institute | null> {
    await this.instituteRepository.update(id, updateData);
    return await this.getInstitute(id);
  }

  async deleteInstitute(id: string): Promise<void> {
    await this.instituteRepository.update(id, { active: false });
  }

  async getInstitutesByType(instituteType: InstituteType, limit: number = 20): Promise<Institute[]> {
    return await this.instituteRepository.find({
      where: { 
        active: true, 
        institute_type: instituteType 
      },
      order: { 
        average_rating: "DESC" 
      },
      take: limit
    });
  }

  async searchByLocation(
    lat: number, 
    lng: number, 
    radius: number = 10, 
    filters: Partial<InstituteFilters> = {}
  ): Promise<Institute[]> {
    const locationFilters = { ...filters, location: { lat, lng, radius } };
    const result = await this.listInstitutes({
      page: 1,
      limit: 50,
      filters: locationFilters
    });

    return result.institutes;
  }

  async calculatePrayerTimes(instituteId: string, date?: Date): Promise<PrayerTimes | null> {
    const institute = await this.getInstitute(instituteId);
    if (!institute || !institute.prayer_times) return null;

    const targetDate = date || new Date();
    
    // If manual times are set, use them
    if (institute.prayer_times.manual_times) {
      return {
        ...institute.prayer_times.manual_times,
        date: targetDate.toISOString().split('T')[0],
        method: 'manual'
      };
    }

    // If auto-calculation is enabled, calculate based on location and method
    if (institute.prayer_times.auto_calculate && institute.address.coordinates) {
      // This would integrate with a prayer times calculation library
      // For now, return placeholder times
      return {
        fajr: '05:30',
        sunrise: '07:15',
        dhuhr: '12:45',
        asr: '15:30',
        maghrib: '18:20',
        isha: '20:00',
        date: targetDate.toISOString().split('T')[0],
        method: institute.prayer_times.method
      };
    }

    return null;
  }

  async getUpcomingEvents(instituteId: string, limit: number = 10): Promise<any[]> {
    const institute = await this.getInstitute(instituteId);
    if (!institute || !institute.events) return [];

    const now = new Date();
    return institute.events
      .filter(event => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit);
  }

  async registerForEvent(instituteId: string, eventId: string, userId: string): Promise<boolean> {
    const institute = await this.getInstitute(instituteId);
    if (!institute || !institute.events) return false;

    const event = institute.events.find(e => e.id === eventId);
    if (!event) return false;

    // Check if event is full
    if (event.max_attendees && event.current_attendees >= event.max_attendees) {
      return false;
    }

    // In a real implementation, you would:
    // 1. Check if user is already registered
    // 2. Add user to event attendees
    // 3. Update current_attendees count
    // 4. Send confirmation email

    event.current_attendees += 1;
    await this.instituteRepository.save(institute);

    return true;
  }

  async processDonation(
    instituteId: string, 
    amount: number, 
    category?: string,
    isZakat: boolean = false,
    donorInfo?: any
  ): Promise<{ success: boolean; reference?: string; error?: string }> {
    const institute = await this.getInstitute(instituteId);
    if (!institute || !institute.donation_info?.accepts_donations) {
      return { success: false, error: 'Institute does not accept donations' };
    }

    if (amount <= 0) {
      return { success: false, error: 'Invalid donation amount' };
    }

    // Validate category if specified
    if (category) {
      const validCategory = institute.donation_info.donation_categories?.find(
        cat => cat.name.en === category || cat.name.sv === category
      );
      
      if (!validCategory) {
        return { success: false, error: 'Invalid donation category' };
      }

      // Check if Zakat donation is going to Zakat-eligible category
      if (isZakat && !validCategory.zakat_eligible) {
        return { success: false, error: 'Category is not Zakat eligible' };
      }
    }

    // Generate reference number
    const reference = institute.formatSwedishBankReference(
      donorInfo?.name || 'Anonymous',
      category
    );

    // In a real implementation, you would:
    // 1. Process payment through Swish/Stripe
    // 2. Update donation category amounts
    // 3. Send receipt to donor
    // 4. Update institute's total donations

    return {
      success: true,
      reference
    };
  }

  async getEducationalPrograms(instituteId: string, language: string = 'sv'): Promise<any[]> {
    const institute = await this.getInstitute(instituteId);
    if (!institute || !institute.educational_programs) return [];

    const programs = institute.educational_programs[language] || 
                    institute.educational_programs['sv'] || 
                    institute.educational_programs['en'] || 
                    [];

    return programs.filter(program => program.enrollment_open);
  }

  async enrollInProgram(
    instituteId: string, 
    programId: string, 
    studentInfo: any
  ): Promise<{ success: boolean; error?: string }> {
    const institute = await this.getInstitute(instituteId);
    if (!institute || !institute.educational_programs) {
      return { success: false, error: 'Institute or programs not found' };
    }

    // Find program across all languages
    let program: any = null;
    let programLanguage: string = '';

    for (const lang in institute.educational_programs) {
      const foundProgram = institute.educational_programs[lang].find(p => p.id === programId);
      if (foundProgram) {
        program = foundProgram;
        programLanguage = lang;
        break;
      }
    }

    if (!program) {
      return { success: false, error: 'Program not found' };
    }

    if (!program.enrollment_open) {
      return { success: false, error: 'Enrollment is closed for this program' };
    }

    if (program.max_students && program.current_students >= program.max_students) {
      return { success: false, error: 'Program is full' };
    }

    // In a real implementation, you would:
    // 1. Validate student information
    // 2. Check prerequisites
    // 3. Process enrollment fee if applicable
    // 4. Add student to program
    // 5. Send confirmation

    program.current_students += 1;
    await this.instituteRepository.save(institute);

    return { success: true };
  }

  async getVolunteerOpportunities(instituteId: string): Promise<any[]> {
    const institute = await this.getInstitute(instituteId);
    if (!institute || !institute.volunteer_opportunities) return [];

    return institute.volunteer_opportunities.filter(opp => opp.active);
  }

  async applyForVolunteerPosition(
    instituteId: string, 
    opportunityId: string, 
    applicantInfo: any
  ): Promise<{ success: boolean; error?: string }> {
    const institute = await this.getInstitute(instituteId);
    if (!institute || !institute.volunteer_opportunities) {
      return { success: false, error: 'Institute or opportunities not found' };
    }

    const opportunity = institute.volunteer_opportunities.find(opp => opp.id === opportunityId);
    if (!opportunity || !opportunity.active) {
      return { success: false, error: 'Volunteer opportunity not available' };
    }

    // In a real implementation, you would:
    // 1. Validate applicant information
    // 2. Store application
    // 3. Notify institute contact person
    // 4. Send confirmation to applicant

    return { success: true };
  }

  async getFridayPrayerInfo(instituteId: string): Promise<any | null> {
    const institute = await this.getInstitute(instituteId);
    if (!institute || !institute.friday_prayer) return null;

    return {
      ...institute.friday_prayer,
      next_friday: this.getNextFridayDate(),
      registration_required: institute.friday_prayer.registration_required
    };
  }

  private getNextFridayDate(): string {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7; // 5 = Friday
    
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);
    
    return nextFriday.toISOString().split('T')[0];
  }

  async updateBusinessMetrics(instituteId: string): Promise<void> {
    // This would typically be called by a scheduled job
    // to update institute metrics based on activity data
    const institute = await this.getInstitute(instituteId);
    if (!institute) return;

    // Calculate metrics from activity data (placeholder implementation)
    const metrics = {
      monthly_events: 0, // Calculate from events
      monthly_donations: 0, // Calculate from donations
      active_programs: 0, // Calculate from educational programs
      volunteer_applications: 0, // Calculate from applications
      average_attendance: 0, // Calculate from event attendance
      community_engagement_score: 0 // Calculate composite score
    };

    // In a real implementation, you would update these metrics
    // await this.instituteRepository.update(instituteId, { business_metrics: metrics });
  }

  async claimInstitute(instituteId: string, userId: string): Promise<boolean> {
    // Implementation for institute representative claiming their listing
    const institute = await this.getInstitute(instituteId);
    if (!institute) return false;

    // Add claim request logic here
    // For now, just mark as verified if not already claimed
    if (!institute.verified) {
      await this.instituteRepository.update(instituteId, {
        verified: true
        // owner_id: userId // This would be added to the entity
      });
      return true;
    }

    return false;
  }
}
