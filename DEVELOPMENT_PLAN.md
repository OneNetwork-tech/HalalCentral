# HalalCentral - Comprehensive Development Plan
## Multilingual Multi-Vendor Halal Platform with Medusa.js

### Project Overview
A comprehensive platform connecting Halal vendors, institutes, and consumers in Sweden with multilingual support (English, Swedish, Arabic) and localized features.

---

## **Phase 1: Building the Minimum Viable Product (MVP)**

### **Step 1: Foundational Setup & Core Backend** 🏗️

#### 1.1 Project Initialization
```bash
# Initialize Medusa Backend
npx create-medusa-app@latest halalcentral-backend
cd halalcentral-backend

# Initialize Next.js Frontend
npx create-next-app@latest halalcentral-frontend --typescript --tailwind --eslint
```

#### 1.2 Database Configuration
- **PostgreSQL Setup**: Configure connection for Swedish hosting requirements
- **Environment Variables**: 
  ```env
  DATABASE_URL=postgresql://username:password@localhost:5432/halalcentral
  REDIS_URL=redis://localhost:6379
  JWT_SECRET=your-jwt-secret
  COOKIE_SECRET=your-cookie-secret
  ```

#### 1.3 Shared Base Entity (Core Reusable Functionality)
Create a shared base entity for common functionality between Vendors and Institutes:

**File: `src/models/base-business-entity.ts`**
```typescript
import { BaseEntity, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

export abstract class BaseBusinessEntity extends BaseEntity {
  @Column({ type: "jsonb" })
  name: {
    en: string
    sv: string
    ar: string
  }

  @Column({ type: "jsonb" })
  description: {
    en: string
    sv: string
    ar: string
  }

  @Column({ type: "jsonb" })
  address: {
    street: string
    city: string
    postal_code: string
    county: string
    country: string
    coordinates?: {
      lat: number
      lng: number
    }
  }

  @Column({ type: "jsonb" })
  contact_info: {
    phone: string
    email: string
    website?: string
    social_media?: {
      facebook?: string
      instagram?: string
      twitter?: string
    }
  }

  @Column({ default: false })
  verified: boolean

  @Column({ default: true })
  active: boolean

  @Column({ type: "jsonb", nullable: true })
  business_hours: {
    [key: string]: {
      open: string
      close: string
      closed?: boolean
    }
  }

  @Column({ type: "jsonb", nullable: true })
  certifications: {
    halal_cert?: {
      issuer: string
      valid_until: Date
      certificate_url?: string
    }
    business_license?: {
      number: string
      valid_until: Date
    }
  }

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
```

#### 1.4 Vendor Plugin Structure
**Directory: `src/plugins/vendor-plugin/`**

**Vendor Entity (`src/plugins/vendor-plugin/entities/vendor.ts`):**
```typescript
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm"
import { BaseBusinessEntity } from "../../../models/base-business-entity"

export enum VendorType {
  RESTAURANT = "restaurant",
  GROCERY_STORE = "grocery_store",
  BUTCHER = "butcher",
  BAKERY = "bakery",
  CATERING = "catering",
  FOOD_TRUCK = "food_truck"
}

@Entity()
export class Vendor extends BaseBusinessEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: VendorType
  })
  vendor_type: VendorType

  @Column({ type: "jsonb", nullable: true })
  cuisine_types: string[]

  @Column({ type: "jsonb", nullable: true })
  dietary_options: {
    halal: boolean
    vegetarian: boolean
    vegan: boolean
    gluten_free: boolean
  }

  @Column({ default: false })
  delivery_available: boolean

  @Column({ default: false })
  takeaway_available: boolean

  @Column({ default: false })
  qr_ordering_enabled: boolean

  @Column({ type: "decimal", precision: 3, scale: 2, default: 0 })
  commission_rate: number

  @Column({ nullable: true })
  owner_id: string
}
```

#### 1.5 Institute Plugin Structure
**Directory: `src/plugins/institute-plugin/`**

**Institute Entity (`src/plugins/institute-plugin/entities/institute.ts`):**
```typescript
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"
import { BaseBusinessEntity } from "../../../models/base-business-entity"

export enum InstituteType {
  MOSQUE = "mosque",
  ISLAMIC_SCHOOL = "islamic_school",
  COMMUNITY_CENTER = "community_center",
  CHARITY = "charity",
  RELIGIOUS_ORGANIZATION = "religious_organization"
}

@Entity()
export class Institute extends BaseBusinessEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: InstituteType
  })
  institute_type: InstituteType

  @Column({ type: "jsonb", nullable: true })
  services: {
    prayer_times?: boolean
    friday_prayers?: boolean
    educational_programs?: boolean
    community_events?: boolean
    marriage_services?: boolean
    funeral_services?: boolean
    counseling?: boolean
  }

  @Column({ type: "jsonb", nullable: true })
  prayer_times: {
    fajr: string
    dhuhr: string
    asr: string
    maghrib: string
    isha: string
    jumma?: string
  }

  @Column({ default: 0 })
  capacity: number

  @Column({ nullable: true })
  imam_name: string

  @Column({ nullable: true })
  owner_id: string
}
```

#### 1.6 API Endpoints Structure
Both plugins will share common service patterns:

**Shared Service Base (`src/services/base-business-service.ts`):**
```typescript
import { TransactionBaseService } from "@medusajs/medusa"

export abstract class BaseBusinessService extends TransactionBaseService {
  protected abstract repository: any

  async create(data: any): Promise<any> {
    return this.atomicPhase_(async (manager) => {
      const repo = manager.getCustomRepository(this.repository)
      const entity = repo.create(data)
      return await repo.save(entity)
    })
  }

  async update(id: string, data: any): Promise<any> {
    return this.atomicPhase_(async (manager) => {
      const repo = manager.getCustomRepository(this.repository)
      await repo.update(id, data)
      return await repo.findOne(id)
    })
  }

  async delete(id: string): Promise<void> {
    return this.atomicPhase_(async (manager) => {
      const repo = manager.getCustomRepository(this.repository)
      await repo.delete(id)
    })
  }

  async findById(id: string): Promise<any> {
    const repo = this.manager_.getCustomRepository(this.repository)
    return await repo.findOne(id)
  }

  async findAll(filters?: any): Promise<any[]> {
    const repo = this.manager_.getCustomRepository(this.repository)
    return await repo.find(filters)
  }
}
```

### **Step 2: Frontend & Basic User Interface** 🎨

#### 2.1 Next.js Setup with Internationalization
```bash
npm install next-i18next react-i18next
npm install @medusajs/medusa-js
npm install @headlessui/react @heroicons/react
npm install clsx tailwind-merge
```

#### 2.2 Internationalization Configuration
**File: `next-i18next.config.js`**
```javascript
module.exports = {
  i18n: {
    defaultLocale: 'sv',
    locales: ['en', 'sv', 'ar'],
    localeDetection: false,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}
```

#### 2.3 Swedish Localization Utilities
**File: `lib/localization.ts`**
```typescript
export const formatSwedishDate = (date: Date): string => {
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

export const formatSwedishCurrency = (amount: number): string => {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK'
  }).format(amount)
}

export const formatSwedishTime = (time: string): string => {
  return new Intl.DateTimeFormat('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(`2000-01-01T${time}`))
}
```

#### 2.4 Core Pages Structure
```
pages/
├── index.tsx (Homepage)
├── restaurants/
│   ├── index.tsx (Restaurant listings)
│   └── [slug].tsx (Individual restaurant)
├── mosques/
│   ├── index.tsx (Mosque listings)
│   └── [slug].tsx (Individual mosque)
├── shops/
│   ├── index.tsx (Shop listings)
│   └── [slug].tsx (Individual shop)
└── community/
    ├── events.tsx
    └── jobs.tsx
```

### **Step 3: Multilingual Support Implementation** 🌐

#### 3.1 Translation Files Structure
```
public/locales/
├── en/
│   ├── common.json
│   ├── vendor.json
│   └── institute.json
├── sv/
│   ├── common.json
│   ├── vendor.json
│   └── institute.json
└── ar/
    ├── common.json
    ├── vendor.json
    └── institute.json
```

#### 3.2 Swedish-Specific Translations (`public/locales/sv/common.json`)
```json
{
  "navigation": {
    "home": "Hem",
    "restaurants": "Restauranger",
    "mosques": "Moskéer",
    "shops": "Butiker",
    "community": "Gemenskap"
  },
  "business_hours": {
    "monday": "Måndag",
    "tuesday": "Tisdag",
    "wednesday": "Onsdag",
    "thursday": "Torsdag",
    "friday": "Fredag",
    "saturday": "Lördag",
    "sunday": "Söndag"
  },
  "payment": {
    "swish": "Betala med Swish",
    "card": "Betala med kort",
    "cash": "Kontant"
  },
  "address": {
    "street": "Gatuadress",
    "postal_code": "Postnummer",
    "city": "Stad",
    "county": "Län"
  }
}
```

### **Step 4: Core Features & Launch Readiness** 🚀

#### 4.1 Claim Business Flow
**Claim Request Entity (`src/models/claim-request.ts`):**
```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm"

export enum ClaimStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected"
}

export enum BusinessType {
  VENDOR = "vendor",
  INSTITUTE = "institute"
}

@Entity()
export class ClaimRequest {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  business_id: string

  @Column({
    type: "enum",
    enum: BusinessType
  })
  business_type: BusinessType

  @Column()
  user_email: string

  @Column()
  user_name: string

  @Column()
  user_phone: string

  @Column({ type: "text" })
  verification_documents: string // JSON string of document URLs

  @Column({
    type: "enum",
    enum: ClaimStatus,
    default: ClaimStatus.PENDING
  })
  status: ClaimStatus

  @Column({ type: "text", nullable: true })
  admin_notes: string

  @CreateDateColumn()
  created_at: Date
}
```

#### 4.2 Swedish Business Verification
**File: `src/services/swedish-business-verification.ts`**
```typescript
export class SwedishBusinessVerificationService {
  // Integration with Swedish business registry (Bolagsverket)
  async verifyOrganizationNumber(orgNumber: string): Promise<boolean> {
    // Validate Swedish organization number format
    const cleanOrgNumber = orgNumber.replace(/\D/g, '')
    if (cleanOrgNumber.length !== 10) return false
    
    // Implement Luhn algorithm for Swedish org numbers
    return this.validateLuhnAlgorithm(cleanOrgNumber)
  }

  private validateLuhnAlgorithm(number: string): boolean {
    // Swedish organization number validation logic
    const digits = number.split('').map(Number)
    let sum = 0
    
    for (let i = 0; i < 9; i++) {
      let digit = digits[i]
      if (i % 2 === 1) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
    }
    
    const checkDigit = (10 - (sum % 10)) % 10
    return checkDigit === digits[9]
  }
}
```

---

## **Phase 2: Achieving Launch-Ready Status**

### **Step 1: Monetization & Commercial Features** 💰

#### 1.1 Commission System
**Commission Entity (`src/models/commission.ts`):**
```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm"

@Entity()
export class Commission {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  order_id: string

  @Column()
  vendor_id: string

  @Column({ type: "decimal", precision: 10, scale: 2 })
  order_total: number

  @Column({ type: "decimal", precision: 3, scale: 2 })
  commission_rate: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  commission_amount: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  platform_fee: number

  @Column({ default: false })
  paid_to_vendor: boolean

  @CreateDateColumn()
  created_at: Date
}
```

#### 1.2 Swish Payment Integration
**Swish Payment Provider (`src/services/swish-payment-provider.ts`):**
```typescript
import { AbstractPaymentProcessor, PaymentProcessorContext, PaymentProcessorError, PaymentProcessorSessionResponse, PaymentSessionStatus } from "@medusajs/medusa"

export class SwishPaymentProcessor extends AbstractPaymentProcessor {
  static identifier = "swish"

  constructor(container, options) {
    super(container, options)
    this.swishApiUrl = options.swish_api_url
    this.merchantId = options.merchant_id
    this.certificate = options.certificate
  }

  async initiatePayment(context: PaymentProcessorContext): Promise<PaymentProcessorError | PaymentProcessorSessionResponse> {
    try {
      const paymentRequest = {
        payeePaymentReference: context.resource_id,
        callbackUrl: `${this.options.callback_url}/swish/callback`,
        payerAlias: context.customer?.phone,
        payeeAlias: this.merchantId,
        amount: context.amount / 100, // Convert from öre to SEK
        currency: "SEK",
        message: `Betalning till HalalCentral - Order ${context.resource_id}`
      }

      const response = await this.makeSwishRequest('/paymentrequests', paymentRequest)
      
      return {
        session_data: {
          swish_payment_id: response.id,
          qr_code: response.qrCode,
          deep_link: response.deepLink
        }
      }
    } catch (error) {
      return {
        error: error.message,
        code: "swish_error",
        detail: error
      }
    }
  }

  async authorizePayment(paymentSessionData: Record<string, unknown>): Promise<PaymentProcessorError | { status: PaymentSessionStatus; data: Record<string, unknown> }> {
    try {
      const swishPaymentId = paymentSessionData.swish_payment_id as string
      const paymentStatus = await this.checkSwishPaymentStatus(swishPaymentId)
      
      if (paymentStatus === 'PAID') {
        return {
          status: PaymentSessionStatus.AUTHORIZED,
          data: paymentSessionData
        }
      }
      
      return {
        status: PaymentSessionStatus.PENDING,
        data: paymentSessionData
      }
    } catch (error) {
      return {
        error: error.message,
        code: "swish_auth_error",
        detail: error
      }
    }
  }

  private async makeSwishRequest(endpoint: string, data: any) {
    // Implement Swish API request with proper certificates and authentication
    // This would include proper SSL certificate handling for Swish API
  }

  private async checkSwishPaymentStatus(paymentId: string): Promise<string> {
    // Check payment status with Swish API
    const response = await this.makeSwishRequest(`/paymentrequests/${paymentId}`, null, 'GET')
    return response.status
  }
}
```

### **Step 2: Enhanced Functionality** ✨

#### 2.1 QR Code Ordering System
**QR Menu Service (`src/services/qr-menu-service.ts`):**
```typescript
import QRCode from 'qrcode'

export class QRMenuService {
  async generateQRCode(vendorId: string): Promise<string> {
    const menuUrl = `${process.env.FRONTEND_URL}/menu/${vendorId}`
    
    const qrCodeOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }

    return await QRCode.toDataURL(menuUrl, qrCodeOptions)
  }

  async generatePrintableQR(vendorId: string, vendorName: string): Promise<Buffer> {
    // Generate a printable QR code with Swedish text
    const qrCode = await this.generateQRCode(vendorId)
    
    // Create a printable version with instructions in Swedish
    const instructions = {
      sv: "Skanna för att se menyn och beställa",
      en: "Scan to view menu and order",
      ar: "امسح لعرض القائمة والطلب"
    }
    
    // Return formatted image buffer for printing
    return this.createPrintableImage(qrCode, vendorName, instructions)
  }

  private async createPrintableImage(qrCode: string, vendorName: string, instructions: any): Promise<Buffer> {
    // Implementation for creating a printable QR code with text
    // This would use a library like Canvas or Sharp to create the final image
  }
}
```

#### 2.2 Prayer Times Integration
**Prayer Times Service (`src/services/prayer-times-service.ts`):**
```typescript
export class PrayerTimesService {
  async getPrayerTimes(latitude: number, longitude: number, date?: Date): Promise<any> {
    // Integration with Islamic prayer times API
    const targetDate = date || new Date()
    
    // Use Aladhan API or similar service
    const response = await fetch(
      `http://api.aladhan.com/v1/timings/${this.formatDate(targetDate)}?latitude=${latitude}&longitude=${longitude}&method=3&school=1`
    )
    
    const data = await response.json()
    
    return {
      fajr: data.data.timings.Fajr,
      sunrise: data.data.timings.Sunrise,
      dhuhr: data.data.timings.Dhuhr,
      asr: data.data.timings.Asr,
      maghrib: data.data.timings.Maghrib,
      isha: data.data.timings.Isha,
      date: targetDate
    }
  }

  async updateInstitutePrayerTimes(instituteId: string): Promise<void> {
    // Automatically update prayer times for institutes based on their location
    const institute = await this.instituteService.findById(instituteId)
    
    if (institute.address?.coordinates) {
      const prayerTimes = await this.getPrayerTimes(
        institute.address.coordinates.lat,
        institute.address.coordinates.lng
      )
      
      await this.instituteService.update(instituteId, {
        prayer_times: prayerTimes
      })
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]
  }
}
```

---

## **Phase 3: Scaling the Platform**

### **Step 1: Advanced Integrations & Features** 📲

#### 1.1 Geolocation Search
**Location Service (`src/services/location-service.ts`):**
```typescript
export class LocationService {
  async findNearbyBusinesses(
    latitude: number, 
    longitude: number, 
    radius: number = 10, 
    businessType?: 'vendor' | 'institute'
  ): Promise<any[]> {
    const query = `
      SELECT *, 
        (6371 * acos(cos(radians($1)) * cos(radians(CAST(address->>'coordinates'->>'lat' AS FLOAT))) 
        * cos(radians(CAST(address->>'coordinates'->>'lng' AS FLOAT)) - radians($2)) 
        + sin(radians($1)) * sin(radians(CAST(address->>'coordinates'->>'lat' AS FLOAT))))) AS distance
      FROM ${businessType === 'vendor' ? 'vendor' : businessType === 'institute' ? 'institute' : '(SELECT * FROM vendor UNION ALL SELECT * FROM institute)'} 
      WHERE address->>'coordinates' IS NOT NULL
      HAVING distance < $3
      ORDER BY distance
    `
    
    return await this.manager_.query(query, [latitude, longitude, radius])
  }

  async geocodeSwedishAddress(address: string): Promise<{lat: number, lng: number} | null> {
    // Use Swedish-specific geocoding service or Google Maps API
    // Prioritize Swedish address formats and postal codes
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&region=se&key=${process.env.GOOGLE_MAPS_API_KEY}`
      )
      
      const data = await response.json()
      
      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location
        return {
          lat: location.lat,
          lng: location.lng
        }
      }
      
      return null
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }
}
```

#### 1.2 GDPR Compliance Module
**GDPR Service (`src/services/gdpr-service.ts`):**
```typescript
export class GDPRService {
  async handleDataRequest(userId: string, requestType: 'export' | 'delete'): Promise<any> {
    switch (requestType) {
      case 'export':
        return await this.exportUserData(userId)
      case 'delete':
        return await this.deleteUserData(userId)
    }
  }

  async exportUserData(userId: string): Promise<any> {
    // Collect all user data from various tables
    const userData = {
      profile: await this.getUserProfile(userId),
      orders: await this.getUserOrders(userId),
      reviews: await this.getUserReviews(userId),
      claims: await this.getUserClaims(userId)
    }
    
    return userData
  }

  async deleteUserData(userId: string): Promise<void> {
    // Implement GDPR-compliant data deletion
    // Some data may need to be anonymized rather than deleted for legal/business reasons
    await this.anonymizeUserData(userId)
  }

  async recordConsentChoice(userId: string, consentType: string, granted: boolean): Promise<void> {
    // Record user consent choices for GDPR compliance
    await this.manager_.query(
      'INSERT INTO user_consent (user_id, consent_type, granted, recorded_at) VALUES ($1, $2, $3, NOW())',
      [userId, consentType, granted]
    )
  }
}
```

### **Step 2: Community & Mobile Features** 🌍

#### 2.1 Progressive Web App Configuration
**File: `next.config.js`**
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.halalcentral\.se\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    }
  ]
})

module.exports = withPWA({
  i18n: {
    locales: ['en', 'sv', 'ar'],
    defaultLocale: 'sv'
  },
  images: {
    domains: ['api.halalcentral.se', 'storage.googleapis.com']
  }
})
```

#### 2.2 Community Job Board
**Job Posting Entity (`src/models/job-posting.ts`):**
```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm"

export enum JobType {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  VOLUNTEER = "volunteer",
  INTERNSHIP = "internship"
}

@Entity()
export class JobPosting {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "jsonb" })
  title: {
    en: string
    sv: string
    ar: string
  }

  @Column({ type: "jsonb" })
  description: {
    en: string
    sv: string
    ar: string
  }

  @Column()
  employer_id: string

  @Column({
    type: "enum",
    enum: JobType
  })
  job_type: JobType

  @Column({ type: "jsonb", nullable: true })
  salary_range: {
    min?: number
    max?: number
    currency: string
    period: 'hour' | 'month' | 'year'
  }

  @Column({ type: "jsonb" })
  requirements: {
    en: string[]
    sv: string[]
    ar: string[]
  }

  @Column({ type: "jsonb" })
  location: {
    city: string
    remote_possible: boolean
  }

  @Column({ default: true })
  active: boolean

  @Column({ type: "date" })
  application_deadline: Date

  @CreateDateColumn()
  created_at: Date
}
```

### **Step 3: Financial Tools & Final Polish** ⚖️

#### 3.1 Zakat Calculator
**Zakat Calculator Service (`src/services/zakat-calculator.ts`):**
```typescript
export class ZakatCalculatorService {
  private readonly NISAB_GOLD_GRAMS = 87.48 // grams
  private readonly NISAB_SILVER_GRAMS = 612.36 // grams
  private readonly ZAKAT_RATE = 0.025 // 2.5%

  async calculateZakat(assets: ZakatAssets): Promise<ZakatCalculation> {
    const goldPriceSEK = await this.getCurrentGoldPrice('SEK')
    const silverPriceSEK = await this.getCurrentSilverPrice('SEK')
    
    const nisabGold = this.NISAB_GOLD_GRAMS * goldPriceSEK
    const nisabSilver = this.NISAB_SILVER_GRAMS * silverPriceSEK
    const nisabThreshold = Math.min(nisabGold, nisabSilver)
    
    const totalAssets = this.calculateTotalAssets(assets)
    const zakatableAmount = Math.max(0, totalAssets - nisabThreshold)
    const zakatDue = zakatableAmount * this.ZAKAT_RATE
    
    return {
      totalAssets,
      nisabThreshold,
      zakatableAmount,
      zakatDue,
      currency: 'SEK',
      calculatedAt: new Date(),
      breakdown: this.getZakatBreakdown(assets, nisabThreshold)
    }
  }

  private async getCurrentGoldPrice(currency: string): Promise<number> {
    // Fetch current gold price from financial API
    const response = await fetch(`https://api.metals.live/v1/spot/gold?currency=${currency}`)
    const data = await response.json()
    return data.price
  }

  private async getCurrentSilverPrice(currency: string): Promise<number> {
    // Fetch current silver price from financial API
    const response = await fetch(`https://api.metals.live/v1/spot/silver?currency=${currency}`)
    const data = await response.json()
    return data.price
  }

  private calculateTotalAssets(assets: ZakatAssets): number {
    return (
      assets.cash +
      assets.bankAccounts +
      assets.investments +
      assets.gold +
      assets.silver +
      assets.businessAssets +
      assets.receivables -
      assets.debts
    )
  }
}

interface ZakatAssets {
  cash: number
  bankAccounts: number
  investments: number
  gold: number
  silver: number
  businessAssets: number
  receivables: number
  debts: number
}

interface ZakatCalcul
