# ProjectBuzz - Digital Project Marketplace

A complete digital project marketplace built with React frontend and Node.js backend with MongoDB authentication and Razorpay payment integration.

## Architecture Overview

### Frontend (React + TypeScript)

- **Authentication**: MongoDB-based JWT authentication
- **UI Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **API Communication**: Axios with JWT token authentication
- **State Management**: React Context for authentication

### Backend (Node.js + Express)

- **Authentication**: JWT-based authentication with MongoDB
- **Database**: MongoDB Atlas (production) / Local MongoDB (development)
- **Payment Gateway**: Razorpay Payment Gateway
- **File Storage**: Local file storage with multer
- **API**: RESTful endpoints with validation
- **Security**: Helmet, CORS, input validation

### Key Features

- ✅ MongoDB Atlas cloud database integration
- ✅ Razorpay payment integration with wallet system
- ✅ Role-based access control (buyer/seller/admin)
- ✅ Project CRUD operations with multiple images
- ✅ Purchase and download system
- ✅ Email notification system
- ✅ Seller wallet management with payouts
- ✅ Admin dashboard with comprehensive management
- ✅ Production-ready deployment configuration
- ✅ Comprehensive error handling and monitoring

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (for production) or local MongoDB (for development)
- Razorpay account for payment processing
- Gmail account with App Password for email notifications

### Quick Start (Development)

1. **Install all dependencies**

   ```bash
   npm run install:all
   ```

2. **Setup environment files**

   ```bash
   npm run setup
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   # MongoDB Configuration
   MONGO_URI=mongodb://localhost:27017/projectbuzz

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here

   # Razorpay Configuration
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret

   # Email Configuration
   SMTP_USER=infoprojectbuzz@gmail.com
   SMTP_PASS=your-gmail-app-password
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env` file:

   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   VITE_APP_NAME=ProjectBuzz
   ```

4. **Start the frontend development server**
   ```bash
   npm run dev
   ```

## Production Deployment

### MongoDB Atlas Migration

For production deployment, migrate from local MongoDB to MongoDB Atlas:

1. **Run the migration script**

   ```bash
   npm run atlas:migrate
   ```

2. **Setup Atlas database**

   ```bash
   npm run atlas:setup
   ```

3. **Validate production configuration**

   ```bash
   npm run production:validate
   ```

4. **Verify deployment readiness**
   ```bash
   npm run production:verify
   ```

### Production Environment

1. **Create production environment file**

   ```bash
   cp backend/.env.production.example backend/.env.production
   ```

2. **Update with production values**

   ```env
   NODE_ENV=production
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/projectbuzz
   FRONTEND_URL=https://your-domain.com
   BACKEND_URL=https://api.your-domain.com
   JWT_SECRET=your-production-jwt-secret-64-characters-minimum
   RAZORPAY_KEY_ID=rzp_live_your_production_key
   RAZORPAY_KEY_SECRET=your_production_secret
   ```

3. **Deploy with PM2**
   ```bash
   cd backend
   pm2 start ecosystem.config.js --env production
   ```

For detailed deployment instructions, see [PRODUCTION-DEPLOYMENT.md](./PRODUCTION-DEPLOYMENT.md)

## API Endpoints

### Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <jwt-token>
```

### Projects API

- `GET /api/projects` - Get all approved projects (public)
- `GET /api/projects/my` - Get current user's projects (seller)
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project (seller, with file upload)
- `PUT /api/projects/:id` - Update project (seller)
- `DELETE /api/projects/:id` - Delete project (seller)
- `POST /api/projects/:id/purchase` - Purchase project (buyer)
- `GET /api/projects/:id/download` - Download purchased project

### Users API

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/me/purchases` - Get user's purchases
- `GET /api/users/me/sales` - Get user's sales (seller)
- `GET /api/users/me/stats` - Get user statistics
- `GET /api/users/:id` - Get public user profile
- `GET /api/users` - Get all users (admin)

## File Upload Process

1. **Frontend**: User selects file in form
2. **Frontend**: File sent to backend via multipart/form-data
3. **Backend**: Multer processes file upload
4. **Backend**: File uploaded to Firebase Storage
5. **Backend**: File metadata saved to MongoDB
6. **Backend**: Public download URL returned

## Database Models

### User Model

```javascript
{
  firebaseUid: String,
  email: String,
  displayName: String,
  role: ['buyer', 'seller', 'admin'],
  stats: {
    projectsPurchased: Number,
    projectsSold: Number,
    totalSpent: Number,
    totalEarned: Number
  }
}
```

### Project Model

```javascript
{
  title: String,
  description: String,
  price: Number,
  file: {
    url: String,
    filename: String,
    originalName: String
  },
  seller: ObjectId,
  buyers: [{ user: ObjectId, purchasedAt: Date }],
  status: ['pending', 'approved', 'rejected'],
  category: String,
  tags: [String]
}
```

## Testing the Integration

1. **Start both servers** (backend on :5000, frontend on :5173)
2. **Register/Login** using Firebase Auth
3. **Switch to seller role** in user profile
4. **Create a project** with file upload
5. **Switch to buyer role**
6. **Purchase and download** the project

## New Components

- `SellerDashboardNew.tsx` - Backend-integrated seller dashboard
- `BuyerDashboardNew.tsx` - Backend-integrated buyer dashboard
- `projectService.js` - API service for projects
- `userService.js` - API service for users

## Migration Notes

The original components (`SellerDashboard.tsx`, `BuyerDashboard.tsx`) use direct Firebase calls. The new components (`*New.tsx`) use the backend API. You can gradually migrate by updating the route imports in `App.tsx`.

## Security Features

- Firebase token verification on all protected routes
- Role-based access control
- File type and size validation
- Input sanitization and validation
- CORS configuration
- Helmet security headers

## Troubleshooting

1. **CORS errors**: Check `FRONTEND_URL` in backend `.env`
2. **Auth errors**: Verify Firebase service account configuration
3. **File upload errors**: Check Firebase Storage rules and bucket permissions
4. **MongoDB errors**: Ensure MongoDB is running and connection string is correct
