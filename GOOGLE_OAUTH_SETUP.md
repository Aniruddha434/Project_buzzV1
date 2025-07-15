# Google OAuth Setup for ProjectBuzz

## ✅ **COMPLETED SETUP**

### **Google Cloud Console Project**

- **Project Name**: ProjectBuzz OAuth
- **Creation Date**: July 15, 2025
- **Status**: ✅ Active

### **OAuth 2.0 Client Credentials**

- **Client ID**: `584078217672-hdcv33j1da7p6m4lv4q3pi1g8759asdl.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-[REDACTED-FOR-SECURITY]`
- **Status**: ✅ Enabled

### **Authorized JavaScript Origins**

```
http://localhost:5000
http://localhost:5173
https://project-buzzv1-2.onrender.com
https://project-buzz-v.vercel.app
https://projectbuzz.tech
```

### **Authorized Redirect URIs**

```
http://localhost:5000/api/auth/google/callback
https://project-buzzv1-2.onrender.com/api/auth/google/callback
https://projectbuzz.tech/api/auth/google/callback
```

## 🔧 **Environment Configuration**

### **Backend (.env)**

```env
# OAuth Configuration
GOOGLE_CLIENT_ID=584078217672-hdcv33j1da7p6m4lv4q3pi1g8759asdl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-[YOUR-ACTUAL-CLIENT-SECRET]
```

### **Frontend (.env, .env.development, .env.production)**

```env
# OAuth Configuration
VITE_GOOGLE_CLIENT_ID=584078217672-hdcv33j1da7p6m4lv4q3pi1g8759asdl.apps.googleusercontent.com
```

## 🔄 **OAuth Flow**

1. **User clicks "Sign in with Google"** → `loginWithGoogle()` in AuthContext
2. **Redirects to**: `${BACKEND_URL}/api/auth/google`
3. **Google authenticates** and redirects to: `/api/auth/google/callback`
4. **Backend processes** and redirects to: `${FRONTEND_URL}/auth/callback?token=...`
5. **Frontend handles** the callback in `OAuthCallback.tsx`

## 🚀 **Deployment Configuration**

### **Production Environment Variables**

**Render (Backend)**:

```env
GOOGLE_CLIENT_ID=584078217672-hdcv33j1da7p6m4lv4q3pi1g8759asdl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-[YOUR-ACTUAL-CLIENT-SECRET]
FRONTEND_URL=https://project-buzz-v.vercel.app
```

**Vercel (Frontend)**:

```env
VITE_GOOGLE_CLIENT_ID=584078217672-hdcv33j1da7p6m4lv4q3pi1g8759asdl.apps.googleusercontent.com
VITE_BACKEND_URL=https://project-buzzv1-2.onrender.com
```

## 🧪 **Testing**

### **Development (localhost:5173)**

- ✅ Google OAuth configured
- ✅ Redirect URIs set up
- ✅ Environment variables updated

### **Production (projectbuzz.tech)**

- ✅ Domain added to authorized origins
- ✅ Production redirect URI configured
- ⚠️ **Need to update production environment variables**

## 📋 **Next Steps**

1. **Update Production Environment Variables**:

   - Update Render backend with new Google OAuth credentials
   - Update Vercel frontend with new Google Client ID

2. **Test Google Login**:

   - Test on development (localhost)
   - Test on production (projectbuzz.tech)

3. **Verify OAuth Flow**:
   - Check console logs for any errors
   - Verify successful authentication and redirect

## 🔒 **Security Notes**

- ✅ Client Secret is securely stored in backend environment
- ✅ Frontend only has Client ID (public information)
- ✅ Redirect URIs are restricted to authorized domains
- ✅ OAuth consent screen configured with proper app information

## 🐛 **Troubleshooting**

### **Common Issues**:

1. **redirect_uri_mismatch**: Check Google Cloud Console redirect URIs
2. **invalid_client**: Verify Client ID and Secret are correct
3. **access_denied**: Check OAuth consent screen configuration

### **Debug Steps**:

1. Check browser console for errors
2. Verify environment variables are loaded
3. Check backend logs for OAuth strategy initialization
4. Confirm redirect URIs match exactly in Google Cloud Console

---

**Last Updated**: July 15, 2025  
**Status**: ✅ Ready for testing and deployment
