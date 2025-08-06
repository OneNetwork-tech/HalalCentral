# HalalCentral - Multilingual Multi-Vendor Halal Platform

A comprehensive platform connecting Halal vendors, institutes, and consumers in Sweden with support for English, Swedish, and Arabic languages.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/halalcentral.git
cd halalcentral
```

2. **Install dependencies**
```bash
npm run setup
```

3. **Environment Setup**
```bash
# Backend environment
cp backend/.env.example backend/.env
# Frontend environment  
cp frontend/.env.example frontend/.env
```

4. **Database Setup**
```bash
# Create PostgreSQL database
createdb halalcentral

# Run migrations
cd backend && npm run migrate
```

5. **Start Development Servers**
```bash
npm run dev
```

The backend will be available at `http://localhost:9000` and frontend at `http://localhost:3000`.

## 🏗️ Project Structure

```
halalcentral/
├── backend/                 # Medusa.js backend
│   ├── src/
│   │   ├── models/         # Database entities
│   │   ├── plugins/        # Custom plugins
│   │   │   ├── vendor-plugin/
│   │   │   └── institute-plugin/
│   │   ├── services/       # Business logic
│   │   └── api/           # API endpoints
│   └── package.json
├── frontend/               # Next.js frontend
│   ├── pages/             # Page components
│   ├── components/        # Reusable components
│   ├── lib/              # Utilities
│   ├── public/locales/   # Translation files
│   └── package.json
├── docs/                  # Documentation
└── docker-compose.yml     # Development environment
```

## 🌐 Multilingual Support

The platform supports three languages:
- **Swedish (sv)** - Primary language for Swedish market
- **English (en)** - International communication
- **Arabic (ar)** - Community language support

### Language Features
- Automatic locale detection
- Swedish date/time formatting
- Swedish currency (SEK) formatting
- Right-to-left (RTL) support for Arabic
- Localized business hours and prayer times

## 🏪 Business Types

### Vendors
- Restaurants
- Grocery Stores
- Butchers
- Bakeries
- Catering Services
- Food Trucks

### Institutes
- Mosques
- Islamic Schools
- Community Centers
- Charities
- Religious Organizations

## 💳 Payment Integration

### Supported Payment Methods
- **Swish** - Primary payment method for Sweden
- **Credit/Debit Cards** - Via Stripe
- **Cash** - For in-person transactions

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Database Migrations
```bash
cd backend
npm run migrate
```

### Running Tests
```bash
npm test
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```bash
docker-compose up -d
```

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/halalcentral
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
COOKIE_SECRET=your-cookie-secret
SWISH_API_URL=https://mss.cpc.getswish.net
SWISH_MERCHANT_ID=your-merchant-id
GOOGLE_MAPS_API_KEY=your-google-maps-key
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
NEXT_PUBLIC_SWISH_MERCHANT_ID=your-merchant-id
```

## 📱 Features

### Phase 1 (MVP)
- [x] Vendor and Institute listings
- [x] Multilingual support (EN, SV, AR)
- [x] Business claim system
- [x] Basic search and filtering
- [x] Mobile-responsive design

### Phase 2 (Launch Ready)
- [ ] Commission system
- [ ] Swish payment integration
- [ ] QR code ordering
- [ ] Promotional features
- [ ] Admin dashboard

### Phase 3 (Scaling)
- [ ] Geolocation search
- [ ] Progressive Web App (PWA)
- [ ] Community job board
- [ ] Zakat calculator
- [ ] Advanced analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@halalcentral.se or join our community Discord.

## 🙏 Acknowledgments

- Medusa.js team for the excellent e-commerce framework
- Next.js team for the React framework
- Swedish Muslim community for inspiration and feedback
# HalalCentral

HalalCentral is a platform for discovering halal restaurants, mosques, and Islamic community services in Sweden. The platform connects Muslim consumers with verified halal businesses and community institutions.

## Features

- **Multi-language support** (Swedish, English, Arabic)
- **Business directory** for halal restaurants, shops, and services
- **Mosque finder** with prayer times
- **Community events and services**
- **Swedish market integration** with local business verification
- **Mobile-responsive design**

## Tech Stack

### Backend
- [Medusa.js](https://medusajs.com/) - E-commerce framework
- [TypeORM](https://typeorm.io/) - Database ORM
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Redis](https://redis.io/) - Caching
- Node.js

### Frontend
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [next-i18next](https://github.com/isaachinman/next-i18next) - Internationalization
- TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis
- Docker (optional, for containerized setup)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/halalcentral.git
cd halalcentral
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Environment Setup

1. Create backend environment file:
```bash
cd backend
cp .env.example .env
```

2. Create frontend environment file:
```bash
cd ../frontend
cp .env.example .env.local
```

3. Update environment variables as needed.

### Database Setup

1. Start PostgreSQL and Redis:
```bash
# If using Docker
docker-compose up -d postgres redis

# Or start your local PostgreSQL and Redis instances
```

2. Run database migrations:
```bash
cd backend
npm run migrate
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Open your browser to http://localhost:3000

## Project Structure

```
halalcentral/
├── backend/                 # Medusa.js backend
│   ├── src/
│   │   ├── api/            # API routes
│   │   ├── models/         # Database models
│   │   ├── repositories/   # Database repositories
│   │   └── services/       # Business logic
│   └── medusa-config.js    # Medusa configuration
├── frontend/               # Next.js frontend
│   ├── components/         # React components
│   ├── pages/              # Next.js pages
│   ├── public/             # Static assets
│   └── styles/             # CSS styles
└── docker-compose.yml      # Docker configuration
```

## Development

### Adding New Features

1. Create new models in `backend/src/models/`
2. Create corresponding repositories in `backend/src/repositories/`
3. Create services in `backend/src/services/`
4. Add API routes in `backend/src/api/routes/`
5. Create frontend pages in `frontend/pages/`
6. Add translations in `frontend/public/locales/`

### Internationalization

Translations are stored in `frontend/public/locales/` in JSON format. Each language has its own directory:
- Swedish: `sv/common.json`
- English: `en/common.json`
- Arabic: `ar/common.json`

## Deployment

The application can be deployed using Docker with the provided `docker-compose.yml` file, or by deploying the backend and frontend separately to your preferred hosting platform.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, please open an issue on GitHub.
