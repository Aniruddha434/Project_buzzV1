# 🚀 Render Backend Deployment Guide

## ⚠️ CRITICAL: Correct Configuration

The build failure occurred because Render was trying to build the frontend instead of the backend. Follow these **exact steps**:

## 📋 Step-by-Step Deployment

### 1. **Create New Web Service on Render**
- Go to [render.com](https://render.com)
- Click "New" → "Web Service"
- Connect your GitHub repository: `Project_buzzV1`

### 2. **Configure Service Settings** ⚠️ **CRITICAL**

**Basic Settings:**
- **Name**: `projectbuzz-backend`
- **Branch**: `main`
- **Root Directory**: `backend` ← **MUST BE SET TO "backend"**
- **Runtime**: `Node`

**Build & Deploy:**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- **Free** (for testing) or **Starter** ($7/month for production)

### 3. **Environment Variables** (Add in Render Dashboard)

**Required Variables:**
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/projectbuzz
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-chars
```

**Payment Integration:**
```
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**OAuth Configuration:**
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

**Email Service:**
```
EMAIL_USER=infoprojectbuzz@gmail.com
EMAIL_PASS=your_gmail_app_password
```

**URLs (Update after deployment):**
```
FRONTEND_URL=https://your-vercel-app.vercel.app
BACKEND_URL=https://your-render-app.onrender.com
```

### 4. **Deploy**
- Click "Create Web Service"
- Wait for deployment to complete
- Check logs for any errors

## 🔍 **Troubleshooting**

### If Build Still Fails:

1. **Check Root Directory**: Must be set to `backend`
2. **Verify Build Command**: Should be `npm install` (not `npm run build`)
3. **Check Start Command**: Should be `npm start`
4. **Environment Variables**: Ensure all required vars are set

### Common Issues:

**"vite: not found"** → Root directory is not set to `backend`
**"Cannot find module"** → Missing environment variables
**"Port already in use"** → Use PORT=10000 environment variable

## ✅ **Success Indicators**

- ✅ Build completes without errors
- ✅ Server starts on port 10000
- ✅ Health check endpoint responds: `https://your-app.onrender.com/api/health`
- ✅ No "vite" or frontend-related errors in logs

## 📞 **Support**

If deployment still fails:
1. Check Render build logs
2. Verify all environment variables are set
3. Ensure MongoDB Atlas allows connections from 0.0.0.0/0
4. Test locally with production environment variables

## 🔄 **Auto-Deploy**

Once configured correctly, Render will automatically deploy when you push to the main branch.
