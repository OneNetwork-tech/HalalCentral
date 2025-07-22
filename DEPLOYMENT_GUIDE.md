# HalalCentral - Production Deployment Guide

## Production Infrastructure Setup

### 1. Oracle Cloud Infrastructure Setup

#### VM Instance Configuration
```bash
# Create Oracle Cloud VM Instance
# Recommended: VM.Standard.E4.Flex (2 OCPUs, 16GB RAM)
# OS: Ubuntu 22.04 LTS
# Storage: 200GB Block Volume

# Connect to instance
ssh -i ~/.ssh/oracle_key ubuntu@your-instance-ip
```

#### Initial Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install nginx certbot python3-certbot-nginx -y

# Install Node.js (for build processes)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Domain and SSL Setup

#### Domain Configuration
```bash
# Configure DNS records for your domain
# A record: halalcentral.se -> your-server-ip
# A record: api.halalcentral.se -> your-server-ip
# A record: admin.halalcentral.se -> your-server-ip
# CNAME: www.halalcentral.se -> halalcentral.se

# SSL Certificate with Let's Encrypt
sudo certbot --nginx -d halalcentral.se -d www.halalcentral.se -d api.halalcentral.se -d admin.halalcentral.se
```

#### Nginx Configuration
**File: `/etc/nginx/sites-available/halalcentral`**
```nginx
# Frontend (Next.js)
server {
    listen 80;
    listen [::]:80;
    server_name halalcentral.se www.halalcentral.se;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name halalcentral.se www.halalcentral.se;

    ssl_certificate /etc/letsencrypt/live/halalcentral.se/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/halalcentral.se/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API (Medusa)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.halalcentral.se;

    ssl_certificate /etc/letsencrypt/live/halalcentral.se/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/halalcentral.se/privkey.pem;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://halalcentral.se" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    }
}

# Admin Panel
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.halalcentral.se;

    ssl_certificate /etc/letsencrypt/live/halalcentral.se/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/halalcentral.se/privkey.pem;

    # Admin access restriction
    allow 192.168.1.0/24;  # Your office IP range
    allow your-home-ip;     # Your home IP
    deny all;

    location / {
        proxy_pass http://localhost:7001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Production Docker Configuration

#### Production Docker Compose
**File: `docker-compose.prod.yml`**
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: halalcentral-postgres-prod
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - halalcentral-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: halalcentral-redis-prod
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - halalcentral-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Medusa Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: halalcentral-backend-prod
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      COOKIE_SECRET: ${COOKIE_SECRET}
      NODE_ENV: production
      BACKEND_URL: https://api.halalcentral.se
      FRONTEND_URL: https://halalcentral.se
      ADMIN_URL: https://admin.halalcentral.se
      STORE_CORS: https://halalcentral.se
      ADMIN_CORS: https://admin.halalcentral.se
      SWISH_API_URL: ${SWISH_API_URL}
      SWISH_MERCHANT_ID: ${SWISH_MERCHANT_ID}
      STRIPE_API_KEY: ${STRIPE_API_KEY}
      GOOGLE_MAPS_API_KEY: ${GOOGLE_MAPS_API_KEY}
      SENDGRID_API_KEY: ${SENDGRID_API_KEY}
    ports:
      - "9000:9000"
      - "7001:7001"
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/certificates:/app/certificates
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - halalcentral-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Next.js Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: halalcentral-frontend-prod
    environment:
      NEXT_PUBLIC_MEDUSA_BACKEND_URL: https://api.halalcentral.se
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: ${GOOGLE_MAPS_API_KEY}
      NEXT_PUBLIC_SWISH_MERCHANT_ID: ${SWISH_MERCHANT_ID}
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - halalcentral-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # MinIO for file storage
  minio:
    image: minio/minio:latest
    container_name: halalcentral-minio-prod
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes:
      - minio_data:/data
    networks:
      - halalcentral-network
    command: server /data --console-address ":9001"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  minio_data:
    driver: local

networks:
  halalcentral-network:
    driver: bridge
```

#### Production Environment Variables
**File: `.env.prod`**
```env
# Database
POSTGRES_DB=halalcentral_prod
POSTGRES_USER=halalcentral_prod
POSTGRES_PASSWORD=your-super-secure-db-password

# Redis
REDIS_PASSWORD=your-super-secure-redis-password

# Application Secrets
JWT_SECRET=your-super-secure-jwt-secret-64-chars-long
COOKIE_SECRET=your-super-secure-cookie-secret-64-chars-long

# URLs
BACKEND_URL=https://api.halalcentral.se
FRONTEND_URL=https://halalcentral.se
ADMIN_URL=https://admin.halalcentral.se

# Swish Production
SWISH_API_URL=https://cpc.getswish.net
SWISH_MERCHANT_ID=your-production-merchant-id
SWISH_CERTIFICATE_PATH=/app/certificates/swish-prod.p12
SWISH_CERTIFICATE_PASSWORD=your-certificate-password

# Stripe Production
STRIPE_API_KEY=sk_live_your_production_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret

# Google Services
GOOGLE_MAPS_API_KEY=your-production-google-maps-key

# Email
SENDGRID_API_KEY=your-production-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@halalcentral.se

# File Storage
MINIO_ACCESS_KEY=your-minio-access-key
MINIO_SECRET_KEY=your-minio-secret-key

# Monitoring
SENTRY_DSN=your-production-sentry-dsn

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Production Dockerfiles

#### Backend Production Dockerfile
**File: `backend/Dockerfile.prod`**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S medusa -u 1001

# Copy built application
COPY --from=builder --chown=medusa:nodejs /app/dist ./dist
COPY --from=builder --chown=medusa:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=medusa:nodejs /app/package*.json ./

# Create directories for uploads and certificates
RUN mkdir -p uploads certificates && chown medusa:nodejs uploads certificates

USER medusa

EXPOSE 9000 7001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:9000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
```

#### Frontend Production Dockerfile
**File: `frontend/Dockerfile.prod`**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY next.config.js ./
COPY next-i18next.config.js ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

### 5. Database Backup and Monitoring

#### Automated Backup Script
**File: `scripts/backup.sh`**
```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/backups"
DB_NAME="halalcentral_prod"
DB_USER="halalcentral_prod"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Generate backup filename with timestamp
BACKUP_FILE="$BACKUP_DIR/halalcentral_$(date +%Y%m%d_%H%M%S).sql"

# Create database backup
docker exec halalcentral-postgres-prod pg_dump -U $DB_USER -d $DB_NAME > $BACKUP_FILE

# Compress the backup
gzip $BACKUP_FILE

# Remove old backups (older than retention period)
find $BACKUP_DIR -name "halalcentral_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_FILE.gz s3://your-backup-bucket/database/

echo "Backup completed: $BACKUP_FILE.gz"
```

#### Monitoring Script
**File: `scripts/monitor.sh`**
```bash
#!/bin/bash

# Check if services are running
services=("halalcentral-postgres-prod" "halalcentral-redis-prod" "halalcentral-backend-prod" "halalcentral-frontend-prod")

for service in "${services[@]}"; do
    if ! docker ps | grep -q $service; then
        echo "ALERT: $service is not running"
        # Send alert (email, Slack, etc.)
        curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"🚨 HalalCentral Alert: '$service' is down!"}' \
            $SLACK_WEBHOOK_URL
    fi
done

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "ALERT: Disk usage is at $DISK_USAGE%"
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"⚠️ HalalCentral: Disk usage is at '$DISK_USAGE'%"}' \
        $SLACK_WEBHOOK_URL
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
if [ $MEMORY_USAGE -gt 85 ]; then
    echo "ALERT: Memory usage is at $MEMORY_USAGE%"
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"⚠️ HalalCentral: Memory usage is at '$MEMORY_USAGE'%"}' \
        $SLACK_WEBHOOK_URL
fi
```

### 6. CI/CD Pipeline

#### GitHub Actions Workflow
**File: `.github/workflows/deploy.yml`**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
      
      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test
      
      - name: Build applications
        run: |
          cd backend && npm run build
          cd ../frontend && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/halalcentral
            git pull origin main
            docker-compose -f docker-compose.prod.yml down
            docker-compose -f docker-compose.prod.yml build
            docker-compose -f docker-compose.prod.yml up -d
            
            # Wait for services to be healthy
            sleep 30
            
            # Run database migrations
            docker exec halalcentral-backend-prod npm run migrate
            
            # Clear cache
            docker exec halalcentral-redis-prod redis-cli FLUSHALL
            
            echo "Deployment completed successfully"
```

### 7. Security Hardening

#### Firewall Configuration
```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Fail2ban for SSH protection
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

#### Security Updates
```bash
# Automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades

# Configure automatic updates
echo 'Unattended-Upgrade::Automatic-Reboot "false";' | sudo tee -a /etc/apt/apt.conf.d/50unattended-upgrades
```

### 8. Performance Optimization

#### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_vendor_location ON vendor USING GIST (((address->>'coordinates')::point));
CREATE INDEX CONCURRENTLY idx_institute_location ON institute USING GIST (((address->>'coordinates')::point));
CREATE INDEX CONCURRENTLY idx_vendor_type_active ON vendor (vendor_type, active);
CREATE INDEX CONCURRENTLY idx_institute_type_active ON institute (institute_type, active);
CREATE INDEX CONCURRENTLY idx_business_verified ON vendor (verified);
CREATE INDEX CONCURRENTLY idx_business_verified_institute ON institute (verified);

-- Analyze tables for query optimization
ANALYZE vendor;
ANALYZE institute;
```

#### Redis Configuration
**File: `redis.conf`**
```conf
# Memory optimization
maxmemory 1gb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Security
requirepass your-redis-password
```

### 9. Monitoring and Logging

#### Log Aggregation with ELK Stack (Optional)
```yaml
# Add to docker-compose.prod.yml
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - halalcentral-network

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    volumes:
      - ./logstash/config:/usr/share/logstash/pipeline
    networks:
      - halalcentral-network
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    environment:
      ELASTICSEARCH_HOSTS: http://elasticsearch:9200
    ports:
      - "5601:5601"
    networks:
      - halalcentral-network
    depends_on:
      - elasticsearch
```

### 10. Maintenance Procedures

#### Regular Maintenance Tasks
```bash
# Weekly maintenance script
#!/bin/bash

# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean Docker system
docker system prune -f

# Restart services if needed
docker-compose -f docker-compose.prod.yml restart

# Check SSL certificate expiry
certbot certificates

# Run database maintenance
docker exec halalcentral-postgres-prod psql -U halalcentral_prod -d halalcentral_prod -c "VACUUM ANALYZE;"

# Check disk space and clean logs if needed
if [ $(df / | tail -1 | awk '{print $5}' | sed 's/%//') -gt 80 ]; then
    sudo journalctl --vacuum-time=7d
    docker logs --tail 1000 halalcentral-backend-prod > /tmp/backend.log 2>&1
    docker logs --tail 1000 halalcentral-frontend-prod > /tmp/frontend.log 2>&1
fi

echo "Maintenance completed on $(date)"
```

This deployment guide provides a comprehensive production setup for HalalCentral with security, monitoring, and maintenance procedures. The configuration is optimized for Oracle Cloud Infrastructure but can be adapted for other cloud providers.
