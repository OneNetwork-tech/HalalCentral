🧱 Project Overview

🎯 Purpose:

To provide Muslims in Sweden, Norway, Denmark, and Finland with a multilingual platform to find:



✅ Halal restaurants, grocery stores, shops

🕌 Mosques, Islamic institutes, funeral services

📅 Local Islamic events

🛒 Marketplace to buy halal goods or donate to institutes





Tech Stack Overview

Component - Tech

Backend- MedusaJS (Node.js, TypeScript, PostgreSQL)

Frontend- Next.js (multilingual, responsive)

Database- PostgreSQL

Payments- Stripe (and Swish via custom gateway)

Hosting - frontend , Medusa backend - Oracle cloud

Admin - Medusa Admin or custom admin UI

Notifications: Email (via SendGrid) + SMS (optional)



Core Features & Modules

1. 🌐 Multilingual Support (Frontend & Backend)

Languages: Swedish, English, Arabic, Somali, Turkish, Urdu

Content fields support language variants

Frontend toggle with i18next or next-i18next



2. 🛍️ Vendor Module (Medusa Plugin)

Digital storefronts for:

Restaurants

Grocery shops

Funeral services

Product management

Order management

Opening hours, halal certification upload

QR code-based ordering for restaurants



3. 🕌 Islamic Institute Module (Medusa Plugin)

Public profiles for:

Mosques

Quran schools

Janazah/burial places

Event posting

Donation-based "products"

Contact info, photos, prayer schedules

Verified badge + “Claim this page” system



4. 🗓️ Event Management Module

Any business/institute can post events (iftar, classes, Eid, janazah)

Tag by city, language, and type

Optional paid promotion (highlighted, homepage feature)

Optional RSVP/registration system



5. 💳 Paid Promotions Module

Featured products

Featured listings (vendor pages, institute profiles)

Promoted events

Payments via Stripe/Swish

Auto-expiry system for featured items



6. 💝 Donation Product Module

Mosques and institutes can list donation packages:

One-time or recurring

Zakat-eligible toggle

Stripe integration

Anonymous giving option

Donor CSV export for admins



7. 📲 QR Ordering Module (Restaurants)

Mobile-optimized menu via QR

Table ordering support

Order flow metadata: QR source, table number (optional)

Simple printable QR generator from vendor dashboard



8. 📊 Commission & Billing Module

Per-vendor commission tracking (configurable %)

Monthly billing summary

Admin dashboard view of platform income

Stripe Connect (optional) or manual payouts



9. 🔐 Role & Access Control

Admin (full access)

Vendor (product/order/donation/event management)

Institute Owner (event/donation/profile management)

Customer/User (browse, buy, review)



10. 🧑‍💼 Claim Business Feature

For unclaimed businesses/institutes

Claim request form + admin approval flow

Upon approval, grant access to manage listing







Directory Structure (MedusaJS Backend)

src/

  models/

    vendor.ts

    institute.ts

    event.ts

    promotion.ts

    claim-request.ts

  services/

    vendor-service.ts

    event-service.ts

    promotion-service.ts

  api/

    routes/

      store/

      admin/

    controllers/

  plugins/

    vendor-plugin/

    institute-plugin/

    event-plugin/

    promotion-plugin/

    donation-plugin/

    qr-plugin/

  utils/

    language-helper.ts

    qr-generator.ts



Suggested MVP Development Plan

✅ Phase 1: MVP

Vendor & institute creation + dashboards

Multilingual support (at least 3 languages)

Product + event listing

Basic user frontend

Stripe checkout

Claim business flow

🚀 Phase 2: Launch-Ready

Commission tracking

Featured/promoted content (paid)

QR ordering for restaurants

Donation-based products

Admin control panel

Multi-language SEO (for discoverability)

🌍 Phase 3: Scale

Swish payment integration

Notifications (email/SMS)

Mobile app (React Native or PWA)

Geolocation search

Volunteer/job board

Zakat calculator



Next Steps

✅ Finalize MVP feature list and languages

🛠️ Scaffold Medusa backend with plugins

🎨 Design frontend (Next.js)

🔌 Integrate Stripe (then Swish)

🚀 Deploy: Oracle vm with docker with github and CI/CD



Develop the the site with different phase, step by step