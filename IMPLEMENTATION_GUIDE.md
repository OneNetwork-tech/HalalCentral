# HalalCentral - Implementation Guide

## Getting Started - Step by Step Implementation

### Prerequisites Installation

1. **Install Required Software**
```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Docker & Docker Compose
sudo apt-get update
sudo apt-get install docker.io docker-compose

# PostgreSQL Client (for local development)
sudo apt-get install postgresql-client
```

2. **Clone and Setup Project**
```bash
# Clone the repository
git clone https://github.com/your-org/halalcentral.git
cd halalcentral

# Install root dependencies
npm install

# Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

---

## Phase 1 Implementation (Weeks 1-8)

### Week 1-2: Backend Foundation

#### Step 1: Initialize Medusa Backend
```bash
cd backend

# Install Medusa CLI globally
npm install -g @medusajs/medusa-cli

# Initialize Medusa project
medusa new . --seed

# Install additional dependencies
npm install qrcode axios node-cron jsonwebtoken bcryptjs multer sharp nodemailer ioredis
npm install -D @types/qrcode @types/bcryptjs @types/jsonwebtoken @types/multer @types/nodemailer
```

#### Step 2: Database Setup
```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres redis

# Run migrations
npm run migrate

# Seed initial data
npm run seed
```

#### Step 3: Create Base Entity Structure
```bash
# Create directory structure
mkdir -p src/models src/services src/plugins/vendor-plugin src/plugins/institute-plugin

# Copy the base entity file (already created)
# File: backend/src/models/base-business-entity.ts
```

### Week 3-4: Plugin Development

#### Step 1: Vendor Plugin Implementation
```bash
# Create vendor plugin structure
mkdir -p src/plugins/vendor-plugin/{entities,services,api,migrations}
```

**Create Vendor Entity** (`src/plugins/vendor-plugin/entities/vendor.ts`):
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

#### Step 2: Institute Plugin Implementation
**Create Institute Entity** (`src/plugins/institute-plugin/entities/institute.ts`):
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

### Week 5-6: Frontend Foundation

#### Step 1: Initialize Next.js Frontend
```bash
cd frontend

# Install Next.js with TypeScript
npx create-next-app@latest . --typescript --tailwind --eslint --app

# Install additional dependencies
npm install next-i18next react-i18next @medusajs/medusa-js
npm install @headlessui/react @heroicons/react clsx tailwind-merge
npm install framer-motion react-hook-form @hookform/resolvers zod
npm install react-query axios date-fns react-map-gl mapbox-gl
npm install react-qr-code react-share react-rating-stars-component
npm install swiper keen-slider react-intersection-observer
npm install react-hot-toast js-cookie react-helmet-async
npm install next-seo next-sitemap sharp
```

#### Step 2: Setup Internationalization
```bash
# Copy i18n configuration (already created)
# File: frontend/next-i18next.config.js

# Create translation directories
mkdir -p public/locales/{en,sv,ar}

# Copy Swedish translations (already created)
# File: frontend/public/locales/sv/common.json
```

#### Step 3: Create Basic Page Structure
```bash
# Create page directories
mkdir -p pages/{restaurants,mosques,shops,community}
mkdir -p components/{layout,ui,business}
mkdir -p lib/{api,utils,hooks}
```

### Week 7-8: Core Features Implementation

#### Step 1: API Integration
**Create Medusa Client** (`lib/medusa-client.ts`):
```typescript
import Medusa from "@medusajs/medusa-js"

const medusa = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000",
  maxRetries: 3,
})

export default medusa
```

#### Step 2: Business Listing Pages
**Restaurant Listing Page** (`pages/restaurants/index.tsx`):
```typescript
import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useState, useEffect } from 'react'
import medusa from '../../lib/medusa-client'

interface Restaurant {
  id: string
  name: { en: string; sv: string; ar: string }
  description: { en: string; sv: string; ar: string }
  address: any
  vendor_type: string
  cuisine_types: string[]
  average_rating: number
  verified: boolean
}

export default function RestaurantsPage() {
  const { t, i18n } = useTranslation('common')
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      // This would call your custom vendor API endpoint
      const response = await fetch('/api/vendors?type=restaurant')
      const data = await response.json()
      setRestaurants(data.vendors)
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">{t('loading.default')}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('navigation.restaurants')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">
              {restaurant.name[i18n.language as keyof typeof restaurant.name]}
            </h2>
            <p className="text-gray-600 mb-4">
              {restaurant.description[i18n.language as keyof typeof restaurant.description]}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {restaurant.cuisine_types?.join(', ')}
              </span>
              {restaurant.verified && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  {t('status.verified')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'sv', ['common', 'vendor'])),
    },
  }
}
```

---

## Phase 2 Implementation (Weeks 9-16)

### Week 9-10: Payment Integration

#### Step 1: Swish Payment Provider
**Create Swish Service** (`backend/src/services/swish-payment-service.ts`):
```typescript
import { TransactionBaseService } from "@medusajs/medusa"
import axios from 'axios'
import fs from 'fs'
import https from 'https'

export class SwishPaymentService extends TransactionBaseService {
  private swishApiUrl: string
  private merchantId: string
  private certificate: Buffer
  private certificatePassword: string

  constructor(container, options) {
    super(container)
    this.swishApiUrl = options.swish_api_url
    this.merchantId = options.merchant_id
    this.certificate = fs.readFileSync(options.certificate_path)
    this.certificatePassword = options.certificate_password
  }

  async createPaymentRequest(amount: number, message: string, payerAlias?: string) {
    const httpsAgent = new https.Agent({
      pfx: this.certificate,
      passphrase: this.certificatePassword,
    })

    const paymentRequest = {
      payeePaymentReference: this.generatePaymentReference(),
      callbackUrl: `${process.env.BACKEND_URL}/swish/callback`,
      payerAlias: payerAlias,
      payeeAlias: this.merchantId,
      amount: amount,
      currency: "SEK",
      message: message
    }

    try {
      const response = await axios.post(
        `${this.swishApiUrl}/paymentrequests`,
        paymentRequest,
        {
          httpsAgent,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      return {
        id: response.headers.location?.split('/').pop(),
        qrCode: this.generateQRCode(response.headers.location),
        deepLink: `swish://paymentrequest?token=${response.headers.location?.split('/').pop()}`
      }
    } catch (error) {
      throw new Error(`Swish payment request failed: ${error.message}`)
    }
  }

  private generatePaymentReference(): string {
    return `HC${Date.now()}${Math.random().toString(36).substr(2, 5)}`
  }

  private generateQRCode(paymentUrl: string): string {
    // Generate QR code for the payment URL
    return `https://mpc.getswish.net/qrg-swish/api/v1/prefilled?token=${paymentUrl?.split('/').pop()}&format=svg&size=300`
  }
}
```

### Week 11-12: QR Code Ordering

#### Step 1: QR Menu Generation
**QR Menu Service** (`backend/src/services/qr-menu-service.ts`):
```typescript
import QRCode from 'qrcode'
import { TransactionBaseService } from "@medusajs/medusa"

export class QRMenuService extends TransactionBaseService {
  async generateMenuQR(vendorId: string, tableName?: string): Promise<string> {
    const menuUrl = `${process.env.FRONTEND_URL}/menu/${vendorId}${tableName ? `?table=${tableName}` : ''}`
    
    const qrOptions = {
      errorCorrectionLevel: 'M' as const,
      type: 'image/png' as const,
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    }

    return await QRCode.toDataURL(menuUrl, qrOptions)
  }

  async generatePrintableQR(vendorId: string, vendorName: string, tableNumbers: string[]): Promise<Buffer[]> {
    const qrCodes: Buffer[] = []
    
    for (const tableNumber of tableNumbers) {
      const qrDataUrl = await this.generateMenuQR(vendorId, tableNumber)
      
      // Convert data URL to buffer
      const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      qrCodes.push(buffer)
    }
    
    return qrCodes
  }
}
```

#### Step 2: Menu Page Implementation
**Dynamic Menu Page** (`frontend/pages/menu/[vendorId].tsx`):
```typescript
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useState, useEffect } from 'react'

interface MenuItem {
  id: string
  name: { en: string; sv: string; ar: string }
  description: { en: string; sv: string; ar: string }
  price: number
  category: string
  available: boolean
  dietary_info: string[]
}

export default function MenuPage({ vendor }) {
  const router = useRouter()
  const { t, i18n } = useTranslation('common')
  const { vendorId } = router.query
  const tableNumber = router.query.table as string
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<{[key: string]: number}>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (vendorId) {
      fetchMenu()
    }
  }, [vendorId])

  const fetchMenu = async () => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}/menu`)
      const data = await response.json()
      setMenuItems(data.items)
    } catch (error) {
      console.error('Error fetching menu:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }))
  }

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev }
      if (newCart[itemId] > 1) {
        newCart[itemId]--
      } else {
        delete newCart[itemId]
      }
      return newCart
    })
  }

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find(item => item.id === itemId)
      return total + (item?.price || 0) * quantity
    }, 0)
  }

  if (loading) {
    return <div className="flex justify-center p-8">{t('loading.default')}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold">
          {vendor.name[i18n.language as keyof typeof vendor.name]}
        </h1>
        {tableNumber && (
          <p className="text-gray-600">Bord {tableNumber}</p>
        )}
      </div>

      {/* Menu Items */}
      <div className="p-4">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm mb-4 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {item.name[i18n.language as keyof typeof item.name]}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {item.description[i18n.language as keyof typeof item.description]}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  {item.dietary_info.map((info) => (
                    <span key={info} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {t(`dietary.${info}`)}
                    </span>
                  ))}
                </div>
                <p className="font-bold text-lg">{item.price} SEK</p>
              </div>
              
              <div className="flex items-center gap-2">
                {cart[item.id] > 0 && (
                  <>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="bg-red-500 text-white w-8 h-8 rounded-full"
                    >
                      -
                    </button>
                    <span className="font-semibold">{cart[item.id]}</span>
                  </>
                )}
                <button
                  onClick={() => addToCart(item.id)}
                  className="bg-green-500 text-white w-8 h-8 rounded-full"
                  disabled={!item.available}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      {Object.keys(cart).length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold">Total: {getTotalPrice()} SEK</span>
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg">
              Beställ med Swish
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
  // Fetch vendor data
  const vendorResponse = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/vendors/${params?.vendorId}`)
  const vendor = await vendorResponse.json()

  return {
    props: {
      vendor,
      ...(await serverSideTranslations(locale ?? 'sv', ['common', 'vendor'])),
    },
  }
}
```

### Week 13-14: Commission System

#### Step 1: Commission Tracking
**Commission Entity** (`backend/src/models/commission.ts`):
```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { Vendor } from "../plugins/vendor-plugin/entities/vendor"

@Entity()
export class Commission {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  order_id: string

  @Column()
  vendor_id: string

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: "vendor_id" })
  vendor: Vendor

  @Column({ type: "decimal", precision: 10, scale: 2 })
  order_total: number

  @Column({ type: "decimal", precision: 3, scale: 2 })
  commission_rate: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  commission_amount: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  vendor_payout: number

  @Column({ default: false })
  paid_to_vendor: boolean

  @Column({ type: "date", nullable: true })
  payout_date: Date

  @Column({ nullable: true })
  payout_reference: string

  @CreateDateColumn()
  created_at: Date
}
```

### Week 15-16: Admin Dashboard

#### Step 1: Medusa Admin Customization
**Custom Admin Widget** (`backend/src/admin/widgets/commission-overview.tsx`):
```typescript
import { WidgetConfig } from "@medusajs/admin"
import { useEffect, useState } from "react"

const CommissionOverviewWidget = () => {
  const [commissionData, setCommissionData] = useState({
    totalCommissions: 0,
    pendingPayouts: 0,
    thisMonth: 0
  })

  useEffect(() => {
    fetchCommissionData()
  }, [])

  const fetchCommissionData = async () => {
    try {
      const response = await fetch('/admin/commissions/overview')
      const data = await response.json()
      setCommissionData(data)
    } catch (error) {
      console.error('Error fetching commission data:', error)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Commission Overview</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {commissionData.totalCommissions.toLocaleString('sv-SE')} SEK
          </p>
          <p className="text-sm text-gray-600">Total Commissions</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">
            {commissionData.pendingPayouts.toLocaleString('sv-SE')} SEK
          </p>
          <p className="text-sm text-gray-600">Pending Payouts</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {commissionData.thisMonth.toLocaleString('sv-SE')} SEK
          </p>
          <p className="text-sm text-gray-600">This Month</p>
        </div>
      </div>
    </div>
  )
}

export const config: WidgetConfig = {
  zone: "product.list.before",
}

export default CommissionOverviewWidget
```

---

## Phase 3 Implementation (Weeks 17-24)

### Week 17-18: Geolocation & Search

#### Step 1: Location-Based Search
**Location Service Enhancement** (`backend/src/services/location-service.ts`):
```typescript
import { TransactionBaseService } from "@medusajs/medusa"

export class LocationService extends TransactionBaseService {
  async findNearbyBusinesses(
    latitude: number,
    longitude: number,
    radius: number = 10,
    businessType?: 'vendor' | 'institute',
    filters?: {
      cuisine_types?: string[]
      dietary_options?: string[]
      verified_only?: boolean
    }
  ) {
    let query = `
      SELECT *, 
        (6371 * acos(cos(radians($1)) * cos(radians(CAST(address->>'coordinates'->>'lat' AS FLOAT))) 
        * cos(radians(CAST(address->>'coordinates'->>'lng' AS FLOAT)) - radians($2)) 
        + sin(radians($1)) * sin(radians(CAST(address->>'coordinates'->>'lat' AS FLOAT))))) AS distance
      FROM ${businessType === 'vendor' ? 'vendor' : businessType === 'institute' ? 'institute' : '(SELECT *, \'vendor\' as entity_type FROM vendor UNION ALL SELECT *, \'institute\' as entity_type FROM institute)'} 
      WHERE address->>'coordinates' IS NOT NULL
        AND active = true
    `

    const params = [latitude, longitude, radius]
    let paramIndex = 3

    if (filters?.verified_only) {
      query += ` AND verified = true`
    }

    if (filters?.cuisine_types && filters.cuisine_types.length > 0) {
      query += ` AND cuisine_types ?| array[$${paramIndex}]`
      params.push(filters.cuisine_types)
      paramIndex++
    }

    query += ` HAVING distance < $${paramIndex} ORDER BY distance`
    params.push(radius)

    return await this.manager_.query(query, params)
  }

  async geocodeAddress(address: string): Promise<{lat: number, lng: number} | null> {
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

  async reverseGeocode(lat: number, lng: number): Promise<any> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      )
      
      const data = await response.json()
      return data.results[0] || null
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      return null
    }
  }
}
```

### Week 19-20: Progressive Web App

#### Step 1: PWA Configuration
**Service Worker** (`frontend/public/sw.js`):
```javascript
const CACHE_NAME = 'halalcentral-v1'
const urlsToCache = [
  '/',
  '/restaurants',
  '/mosques',
  '/shops',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
  )
})

// Background sync for offline orders
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineOrders())
  }
})

async function syncOfflineOrders() {
  const offlineOrders = await getOfflineOrders()
  
  for (const order of offlineOrders) {
    try {
      await fetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(order),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      // Remove from offline storage after successful sync
      await removeOfflineOrder(order.id)
    } catch (error) {
      console.error('Failed to sync order:', error)
    }
  }
}
```

**PWA Manifest** (`frontend/public/manifest.json`):
```json
{
  "name": "HalalCentral - Halal Food & Community",
  "short_name": "HalalCentral",
  "description": "Find halal restaurants, mosques, and community services in Sweden",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["food", "lifestyle", "social"],
  "lang": "sv-SE",
  "dir": "ltr"
}
```

### Week 21-22: Community Features

#### Step 1: Job Board Implementation
**Job Posting API** (`backend/src/api/jobs/index.ts`):
```typescript
import { Router } from "express"
import { JobPosting } from "../../models/job-posting"

const router = Router()

// Get all job postings
router.get("/", async (req, res) => {
  try {
    const { type, location, employer_type }
