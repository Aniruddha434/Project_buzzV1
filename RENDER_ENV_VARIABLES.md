# Render Environment Variables for ProjectBuzz Backend

## 🚨 URGENT: CORS Fix Required

Your production backend is blocking access because the CORS configuration is not properly set up for your actual Vercel deployment URL.

## Required Environment Variables

Add/Update these environment variables in your Render dashboard:

### 1. CORS Configuration (CRITICAL)
```
CORS_ORIGIN=https://project-buzz-v.vercel.app,https://projectbuzz.tech,https://www.projectbuzz.tech
```

### 2. Frontend URL
```
FRONTEND_URL=https://project-buzz-v.vercel.app
```

### 3. Production Frontend URL
```
PRODUCTION_FRONTEND_URL=https://projectbuzz.tech
```

## Steps to Fix on Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select your backend service**: `projectbuzz-backend` or similar
3. **Navigate to Environment tab**
4. **Add/Update the variables above**
5. **Click "Deploy Latest Commit"** to apply changes

## Verification

After updating the environment variables:

1. **Run the diagnostic script**:
   ```bash
   node scripts/fix-production-cors.js
   ```

2. **Test your frontend**: Visit https://project-buzz-v.vercel.app and try to:
   - Login/Register
   - Browse projects
   - Make API calls

3. **Check browser console**: Look for CORS errors (should be gone)

## Current Issue

Your backend CORS is currently configured to only allow:
- `http://localhost:*` (development only)
- Some hardcoded Vercel URLs that don't match your actual deployment

## The Fix

The environment variables above will:
- ✅ Allow your actual Vercel deployment URL
- ✅ Allow your custom domain (projectbuzz.tech)
- ✅ Support both www and non-www versions
- ✅ Maintain security by only allowing specific origins

## Alternative: Bulk Environment Variable Import

If you prefer to import all variables at once, use this format in Render's bulk import:

```
CORS_ORIGIN=https://project-buzz-v.vercel.app,https://projectbuzz.tech,https://www.projectbuzz.tech
FRONTEND_URL=https://project-buzz-v.vercel.app
PRODUCTION_FRONTEND_URL=https://projectbuzz.tech
```

## Testing After Fix

1. **Frontend should load without CORS errors**
2. **API calls should work properly**
3. **Authentication should function correctly**
4. **All features should be accessible**

## Need Help?

If you're still experiencing issues after applying these changes:

1. Check Render logs for any error messages
2. Verify the environment variables are properly set
3. Ensure the deployment completed successfully
4. Run the diagnostic script to identify remaining issues

---

**⚡ Quick Fix Summary:**
1. Add `CORS_ORIGIN=https://project-buzz-v.vercel.app,https://projectbuzz.tech,https://www.projectbuzz.tech` to Render
2. Deploy the changes
3. Test your frontend - CORS errors should be resolved!
