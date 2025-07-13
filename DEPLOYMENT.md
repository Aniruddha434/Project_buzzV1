# ProjectBuzz Production Deployment Guide

This guide provides comprehensive instructions for deploying ProjectBuzz to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Payment Gateway Setup](#payment-gateway-setup)
5. [Docker Deployment](#docker-deployment)
6. [Manual Deployment](#manual-deployment)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Security Checklist](#security-checklist)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **MongoDB**: 7.0 or higher (MongoDB Atlas recommended)
- **Redis**: 7.x (optional, for caching)
- **Docker**: 20.x or higher (for containerized deployment)
- **SSL Certificate**: For HTTPS (Let's Encrypt recommended)

### Required Accounts
- MongoDB Atlas account
- Razorpay account (live mode)
- Email service (Gmail/SendGrid)
- Domain name and DNS access
- Cloud hosting provider (AWS/DigitalOcean/Railway)

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/projectbuzz.git
cd projectbuzz
```

### 2. Environment Variables

#### Backend (.env.production)
```bash
cp backend/.env.example backend/.env.production
```

**Critical Variables to Update:**
```env
# Database
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/projectbuzz

# Security
JWT_SECRET=your-64-character-secure-secret
SESSION_SECRET=your-64-character-session-secret

# Payment Gateway
RAZORPAY_KEY_ID=rzp_live_your_key
RAZORPAY_KEY_SECRET=your_live_secret

# Domain Configuration
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Email
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password
```

#### Frontend (.env.production)
```bash
cp frontend/.env.example frontend/.env.production
```

**Update Variables:**
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_BACKEND_URL=https://api.yourdomain.com
VITE_RAZORPAY_KEY_ID=rzp_live_your_key
```

## Database Configuration

### MongoDB Atlas Setup

1. **Create Cluster**
   - Log in to MongoDB Atlas
   - Create a new cluster (M10+ recommended for production)
   - Configure network access (whitelist your server IPs)

2. **Database User**
   ```bash
   # Create production user with readWrite permissions
   Username: production-user
   Password: [generate strong password]
   Database: projectbuzz
   ```

3. **Connection String**
   ```
   mongodb+srv://production-user:password@cluster.mongodb.net/projectbuzz?retryWrites=true&w=majority
   ```

### Database Indexes (Performance)
```javascript
// Run these in MongoDB shell for better performance
db.users.createIndex({ email: 1 }, { unique: true })
db.projects.createIndex({ sellerId: 1 })
db.projects.createIndex({ category: 1 })
db.projects.createIndex({ createdAt: -1 })
db.orders.createIndex({ buyerId: 1 })
db.orders.createIndex({ sellerId: 1 })
db.orders.createIndex({ createdAt: -1 })
```

## Payment Gateway Setup

### Razorpay Live Mode

1. **Account Activation**
   - Complete KYC verification
   - Submit required documents
   - Wait for account activation

2. **API Keys**
   - Generate live API keys
   - Configure webhook endpoints
   - Set up payment methods

3. **Webhook Configuration**
   ```
   Webhook URL: https://api.yourdomain.com/api/payments/webhook
   Events: payment.captured, payment.failed, order.paid
   Secret: [generate webhook secret]
   ```

## Docker Deployment

### 1. Build Images
```bash
# Build backend
docker build -t projectbuzz-backend ./backend

# Build frontend
docker build -t projectbuzz-frontend ./frontend
```

### 2. Production Docker Compose
```bash
# Create production environment file
cp .env.example .env.production

# Deploy with Docker Compose
docker-compose -f docker-compose.yml --env-file .env.production up -d
```

### 3. Health Checks
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Manual Deployment

### 1. Server Setup (Ubuntu 20.04+)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Application Deployment
```bash
# Clone repository
git clone https://github.com/your-username/projectbuzz.git
cd projectbuzz

# Backend setup
cd backend
npm install --production
cp .env.example .env.production
# Edit .env.production with your values

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Frontend setup
cd ../frontend
npm install
npm run build:prod

# Copy build to Nginx
sudo cp -r dist/* /var/www/html/
```

### 3. Nginx Configuration
```nginx
# /etc/nginx/sites-available/projectbuzz
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    root /var/www/html;
    index index.html;
    
    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
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

### 4. SSL Certificate
```bash
# Generate SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## CI/CD Pipeline

### GitHub Actions Setup

1. **Repository Secrets**
   ```
   MONGO_URI
   JWT_SECRET
   RAZORPAY_KEY_SECRET
   SMTP_PASS
   PRODUCTION_SERVER_HOST
   PRODUCTION_SERVER_USER
   PRODUCTION_SSH_KEY
   ```

2. **Deployment Workflow**
   - Automatic testing on PR
   - Build and push Docker images
   - Deploy to staging on develop branch
   - Deploy to production on main branch

## Monitoring and Logging

### 1. Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs

# Application metrics
curl https://api.yourdomain.com/health
```

### 2. Server Monitoring
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Check system resources
htop
df -h
free -m
```

### 3. Log Management
```bash
# Rotate logs
sudo logrotate -f /etc/logrotate.conf

# Monitor Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Security Checklist

- [ ] SSL/TLS certificate installed and configured
- [ ] Strong JWT and session secrets (64+ characters)
- [ ] Database access restricted to application servers
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] Regular security updates applied
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers implemented
- [ ] File upload restrictions in place
- [ ] Input validation and sanitization
- [ ] Error messages don't expose sensitive information
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check MongoDB Atlas network access
   # Verify connection string
   # Check firewall rules
   ```

2. **Payment Gateway Errors**
   ```bash
   # Verify Razorpay keys
   # Check webhook configuration
   # Review payment logs
   ```

3. **SSL Certificate Issues**
   ```bash
   # Renew certificate
   sudo certbot renew
   
   # Check certificate status
   sudo certbot certificates
   ```

4. **High Memory Usage**
   ```bash
   # Restart PM2 processes
   pm2 restart all
   
   # Check memory leaks
   pm2 monit
   ```

### Support

For deployment support:
- Email: support@projectbuzz.com
- Documentation: https://docs.projectbuzz.com
- GitHub Issues: https://github.com/your-username/projectbuzz/issues

---

**Note**: Always test deployment in a staging environment before deploying to production.
