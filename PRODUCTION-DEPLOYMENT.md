# ProjectBuzz Production Deployment Guide

## MongoDB Atlas Migration & Production Setup

This guide will help you migrate ProjectBuzz from local MongoDB to MongoDB Atlas and prepare for production deployment.

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account
- Production domain/hosting setup
- Email service credentials (Gmail App Password)
- Razorpay production keys

## Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new account or sign in
3. Create a new cluster:
   - Choose **M0 Sandbox** (free tier) or higher
   - Select your preferred cloud provider and region
   - Name your cluster (e.g., `projectbuzz-production`)

### 1.2 Configure Database Access

1. **Create Database User:**
   - Go to Database Access → Add New Database User
   - Choose **Password** authentication
   - Username: `projectbuzz-admin` (or your choice)
   - Generate a strong password
   - Grant **Atlas Admin** privileges

2. **Configure Network Access:**
   - Go to Network Access → Add IP Address
   - For development: Add your current IP
   - For production: Add your server's IP address
   - For testing: You can temporarily use `0.0.0.0/0` (allow all)

### 1.3 Get Connection String

1. Go to Clusters → Connect → Connect your application
2. Choose **Node.js** driver version 4.1 or later
3. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/projectbuzz?retryWrites=true&w=majority
   ```
4. Replace `<username>`, `<password>`, and `<cluster-name>` with your actual values

## Step 2: Data Migration

### 2.1 Run Migration Script

```bash
# Install dependencies if not already done
npm run install:all

# Run the interactive migration script
npm run atlas:migrate
```

The migration script will:
- Guide you through Atlas connection setup
- Test both local and Atlas connections
- Migrate all data from local MongoDB to Atlas
- Update environment files
- Verify the migration

### 2.2 Manual Migration (Alternative)

If you prefer manual migration:

```bash
# Export from local MongoDB
mongodump --uri="mongodb://localhost:27017/projectbuzz" --out=./backup

# Import to Atlas
mongorestore --uri="your-atlas-connection-string" ./backup/projectbuzz --nsFrom="projectbuzz.*" --nsTo="projectbuzz.*"
```

## Step 3: Environment Configuration

### 3.1 Update Backend Environment

1. **Copy production environment template:**
   ```bash
   cp backend/.env.production.example backend/.env.production
   ```

2. **Update `.env.production` with your values:**
   ```env
   NODE_ENV=production
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/projectbuzz?retryWrites=true&w=majority
   
   # Your production URLs
   FRONTEND_URL=https://your-domain.com
   BACKEND_URL=https://api.your-domain.com
   
   # Strong JWT secret (64+ characters)
   JWT_SECRET=your-super-secure-production-jwt-secret-64-characters-minimum
   
   # Razorpay production keys
   RAZORPAY_KEY_ID=rzp_live_your_key
   RAZORPAY_KEY_SECRET=your_production_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   
   # Email configuration
   SMTP_USER=infoprojectbuzz@gmail.com
   SMTP_PASS=your-gmail-app-password
   
   # CORS configuration
   CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
   ```

### 3.2 Update Frontend Environment

1. **Create production environment file:**
   ```bash
   # In frontend directory
   cp .env.example .env.production
   ```

2. **Update with production values:**
   ```env
   VITE_API_URL=https://api.your-domain.com/api
   VITE_RAZORPAY_KEY_ID=rzp_live_your_key
   VITE_APP_NAME=ProjectBuzz
   VITE_NODE_ENV=production
   ```

## Step 4: Database Optimization

### 4.1 Setup Indexes and Optimization

```bash
# Run Atlas setup script
npm run atlas:setup
```

This will:
- Create all necessary database indexes
- Validate data integrity
- Optimize database performance
- Setup monitoring

### 4.2 Manual Index Creation (if needed)

```javascript
// Connect to your Atlas database and run:
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.projects.createIndex({ seller: 1 })
db.projects.createIndex({ status: 1 })
db.payments.createIndex({ orderId: 1 }, { unique: true })
db.wallets.createIndex({ user: 1 }, { unique: true })
```

## Step 5: Production Verification

### 5.1 Health Check

```bash
# Run comprehensive health check
npm run atlas:health
```

### 5.2 Manual Testing

1. **Test Database Connection:**
   ```bash
   cd backend
   NODE_ENV=production npm start
   ```

2. **Test API Endpoints:**
   ```bash
   # Health check
   curl https://api.your-domain.com/api
   
   # Test authentication
   curl -X POST https://api.your-domain.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

3. **Test Frontend:**
   ```bash
   cd frontend
   npm run build
   npm run preview
   ```

## Step 6: Security Configuration

### 6.1 MongoDB Atlas Security

1. **Enable Authentication:**
   - Ensure database users have minimal required permissions
   - Use strong passwords (20+ characters)
   - Enable two-factor authentication on Atlas account

2. **Network Security:**
   - Restrict IP access to your production servers only
   - Enable VPC peering if using cloud hosting
   - Enable encryption at rest and in transit

3. **Monitoring:**
   - Set up Atlas alerts for connection issues
   - Monitor slow queries
   - Set up backup schedules

### 6.2 Application Security

1. **Environment Variables:**
   - Never commit `.env.production` to version control
   - Use strong, unique secrets for JWT and sessions
   - Rotate secrets regularly

2. **CORS Configuration:**
   - Restrict CORS to your production domains only
   - Remove development URLs from production CORS

3. **Rate Limiting:**
   - Configure appropriate rate limits for production
   - Monitor for suspicious activity

## Step 7: Deployment

### 7.1 Backend Deployment

```bash
# Build and start backend
cd backend
npm install --production
NODE_ENV=production npm start
```

### 7.2 Frontend Deployment

```bash
# Build frontend
cd frontend
npm install
npm run build

# Deploy dist/ folder to your hosting service
```

### 7.3 Process Management (PM2 Example)

```bash
# Install PM2
npm install -g pm2

# Start backend with PM2
cd backend
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

## Step 8: Monitoring & Maintenance

### 8.1 Database Monitoring

- Monitor Atlas dashboard for performance metrics
- Set up alerts for high CPU/memory usage
- Monitor connection pool usage
- Track slow queries

### 8.2 Application Monitoring

```bash
# Regular health checks
npm run production:verify

# Monitor logs
pm2 logs projectbuzz-backend
```

### 8.3 Backup Strategy

- Atlas automatic backups (enabled by default)
- Regular data exports for critical data
- Test restore procedures

## Troubleshooting

### Common Issues

1. **Connection Timeout:**
   - Check IP whitelist in Atlas
   - Verify connection string format
   - Check network connectivity

2. **Authentication Failed:**
   - Verify username/password in connection string
   - Check database user permissions
   - Ensure special characters are URL-encoded

3. **CORS Errors:**
   - Update CORS_ORIGIN environment variable
   - Check frontend API URL configuration
   - Verify SSL certificates

### Support

For issues with this deployment:
1. Check the health check output: `npm run atlas:health`
2. Review application logs
3. Verify environment variables
4. Test database connectivity

## Security Checklist

- [ ] MongoDB Atlas IP whitelist configured
- [ ] Strong database passwords (20+ characters)
- [ ] JWT secrets are 64+ characters
- [ ] CORS restricted to production domains
- [ ] HTTPS enabled for all endpoints
- [ ] Environment files not in version control
- [ ] Regular security updates scheduled
- [ ] Backup and restore procedures tested
- [ ] Monitoring and alerting configured
- [ ] Rate limiting enabled

## Performance Optimization

- [ ] Database indexes created
- [ ] Connection pooling configured
- [ ] Static assets cached
- [ ] CDN configured for images
- [ ] Gzip compression enabled
- [ ] Database queries optimized
- [ ] File upload limits set
- [ ] Memory usage monitored

---

**Next Steps:** After successful deployment, consider setting up CI/CD pipelines, automated testing, and monitoring dashboards for production maintenance.
