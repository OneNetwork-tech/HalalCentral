import { Entity, Column, Index, PrimaryGeneratedColumn } from "typeorm";
import { BaseBusinessEntity } from "./base-business-entity";

export enum InstituteType {
  MOSQUE = "mosque",
  ISLAMIC_SCHOOL = "islamic_school",
  COMMUNITY_CENTER = "community_center",
  MADRASA = "madrasa",
  ISLAMIC_ORGANIZATION = "islamic_organization",
  CHARITY = "charity",
  CULTURAL_CENTER = "cultural_center",
  OTHER = "other"
}

export enum PrayerMethod {
  ISNA = "isna",
  MWL = "mwl", 
  EGYPT = "egypt",
  MAKKAH = "makkah",
  KARACHI = "karachi",
  TEHRAN = "tehran",
  JAFARI = "jafari"
}

@Entity()
export class Institute extends BaseBusinessEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: InstituteType })
  @Index()
  institute_type: InstituteType;

  @Column({ type: "jsonb", nullable: true })
  prayer_times?: {
    method: PrayerMethod;
    fajr_adjustment: number;
    maghrib_adjustment: number;
    isha_adjustment: number;
    auto_calculate: boolean;
    manual_times?: {
      fajr: string;
      sunrise: string;
      dhuhr: string;
      asr: string;
      maghrib: string;
      isha: string;
    };
  };

  @Column({ type: "jsonb", nullable: true })
  services?: {
    [language: string]: Array<{
      id: string;
      name: string;
      description?: string;
      category: string;
      schedule?: string;
      contact_person?: string;
      registration_required: boolean;
      fee?: number;
      age_group?: string;
      gender_specific?: 'men' | 'women' | 'mixed';
    }>;
  };

  @Column({ type: "jsonb", nullable: true })
  events?: Array<{
    id: string;
    title: { [language: string]: string };
    description: { [language: string]: string };
    date: Date;
    start_time: string;
    end_time: string;
    location?: string;
    speaker?: string;
    registration_required: boolean;
    max_attendees?: number;
    current_attendees: number;
    fee?: number;
    category: string;
    image_url?: string;
    recurring?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      end_date?: Date;
    };
  }>;

  @Column({ type: "jsonb", nullable: true })
  educational_programs?: {
    [language: string]: Array<{
      id: string;
      name: string;
      description?: string;
      instructor: string;
      schedule: string;
      duration_weeks: number;
      fee?: number;
      level: 'beginner' | 'intermediate' | 'advanced';
      age_group?: string;
      gender_specific?: 'men' | 'women' | 'mixed';
      enrollment_open: boolean;
      max_students?: number;
      current_students: number;
    }>;
  };

  @Column({ type: "jsonb", nullable: true })
  donation_info?: {
    accepts_donations: boolean;
    zakat_eligible: boolean;
    donation_methods: {
      swish: boolean;
      bank_transfer: boolean;
      cash: boolean;
      online: boolean;
    };
    bank_details?: {
      account_number: string;
      bank_name: string;
      swift_code?: string;
      reference_format?: string;
    };
    swish_number?: string;
    donation_categories: Array<{
      name: { [language: string]: string };
      description: { [language: string]: string };
      target_amount?: number;
      current_amount: number;
      zakat_eligible: boolean;
    }>;
  };

  @Column({ type: "jsonb", nullable: true })
  volunteer_opportunities?: Array<{
    id: string;
    title: { [language: string]: string };
    description: { [language: string]: string };
    requirements?: string;
    time_commitment: string;
    contact_person: string;
    skills_needed?: string[];
    active: boolean;
    urgent: boolean;
  }>;

  @Column({ type: "jsonb", nullable: true })
  facilities?: {
    prayer_hall_capacity: number;
    separate_women_section: boolean;
    parking_spaces?: number;
    wheelchair_accessible: boolean;
    wudu_facilities: boolean;
    library: boolean;
    kitchen: boolean;
    classrooms?: number;
    playground: boolean;
    funeral_services: boolean;
    marriage_services: boolean;
  };

  @Column({ type: "text", nullable: true })
  imam_info?: string;

  @Column({ type: "jsonb", nullable: true })
  friday_prayer?: {
    khutbah_language: string[];
    first_khutbah_time: string;
    second_khutbah_time?: string;
    capacity: number;
    registration_required: boolean;
  };

  @Column({ type: "jsonb", nullable: true })
  community_programs?: {
    [language: string]: Array<{
      id: string;
      name: string;
      description?: string;
      target_audience: string;
      frequency: string;
      contact_person?: string;
      active: boolean;
    }>;
  };

  // Swedish-specific information
  @Column({ type: "text", nullable: true })
  religious_community_registration?: string; // Trossamfund registration

  @Column({ type: "boolean", default: false })
  state_recognized: boolean; // Statligt erkänt trossamfund

  @Column({ type: "jsonb", nullable: true })
  swedish_integration_programs?: {
    sfi_classes: boolean; // Svenska för invandrare
    civic_orientation: boolean; // Samhällsorientering
    job_assistance: boolean;
    housing_assistance: boolean;
    translation_services: boolean;
    social_services_guidance: boolean;
  };

  @Column({ type: "jsonb", nullable: true })
  partnerships?: {
    local_government: boolean;
    other_religious_communities: boolean;
    schools: string[];
    healthcare_providers: string[];
    social_services: boolean;
  };

  // Calculated fields
  get current_prayer_times(): any {
    // This would calculate current prayer times based on location and method
    // Implementation would use a prayer times calculation library
    return null;
  }

  get next_prayer(): { name: string; time: string } | null {
    // Calculate next prayer time
    return null;
  }

  get upcoming_events(): any[] {
    if (!this.events) return [];
    
    const now = new Date();
    return this.events
      .filter(event => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }

  get active_programs(): any[] {
    if (!this.educational_programs) return [];
    
    const locale = 'sv';
    const programs = this.educational_programs[locale] || this.educational_programs['en'] || [];
    return programs.filter(program => program.enrollment_open);
  }

  // Business logic methods
  canAcceptDonation(amount: number, category?: string): boolean {
    if (!this.donation_info?.accepts_donations) return false;
    return amount > 0;
  }

  getZakatEligibleCategories(): any[] {
    if (!this.donation_info?.donation_categories) return [];
    return this.donation_info.donation_categories.filter(cat => cat.zakat_eligible);
  }

  isEventFull(eventId: string): boolean {
    const event = this.events?.find(e => e.id === eventId);
    if (!event || !event.max_attendees) return false;
    return event.current_attendees >= event.max_attendees;
  }

  isProgramFull(programId: string): boolean {
    if (!this.educational_programs) return false;
    
    for (const lang in this.educational_programs) {
      const program = this.educational_programs[lang].find(p => p.id === programId);
      if (program && program.max_students) {
        return program.current_students >= program.max_students;
      }
    }
    return false;
  }

  getContactForService(serviceId: string): string | null {
    if (!this.services) return null;
    
    for (const lang in this.services) {
      const service = this.services[lang].find(s => s.id === serviceId);
      if (service?.contact_person) {
        return service.contact_person;
      }
    }
    return null;
  }

  formatSwedishBankReference(donorName: string, category?: string): string {
    // Generate Swedish bank transfer reference
    const baseRef = this.donation_info?.bank_details?.reference_format || 'DONATION';
    const timestamp = Date.now().toString().slice(-6);
    return `${baseRef}-${timestamp}`;
  }
}
