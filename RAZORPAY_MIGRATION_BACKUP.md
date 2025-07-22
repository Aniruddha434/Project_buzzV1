# Razorpay Live Mode Migration - Backup & Plan

## Current Configuration (BACKUP)

### Backend (.env) - Current Test Configuration:
```
RAZORPAY_KEY_ID=rzp_test_YGWtAWJ4x1eheR
RAZORPAY_KEY_SECRET=SbuhC0u6zCCQXsO92ZNp1qCa
RAZORPAY_ENVIRONMENT=test
```

### Frontend (.env) - Current Test Configuration:
```
VITE_RAZORPAY_KEY_ID=rzp_test_YGWtAWJ4x1eheR
```

### Production (render.yaml) - Current Placeholder:
```
RAZORPAY_KEY_ID=rzp_live_your_production_key_id
RAZORPAY_KEY_SECRET=your_production_razorpay_secret
RAZORPAY_ENVIRONMENT=production
```

## Migration Plan

### Phase 1: Update Local Development (Optional - Keep Test)
- Keep test keys for development
- Add live key configuration comments

### Phase 2: Update Production Environment
- Replace placeholder live keys with actual live keys
- Update Render environment variables
- Update Vercel environment variables

### Phase 3: Update Frontend Production
- Update Vercel environment with live Razorpay key
- Ensure proper environment detection

### Phase 4: Testing & Verification
- Test payment flow in production
- Verify webhook endpoints
- Monitor payment processing

## Live Keys Required:
1. RAZORPAY_KEY_ID (live) - From Razorpay Dashboard
2. RAZORPAY_KEY_SECRET (live) - From Razorpay Dashboard  
3. RAZORPAY_WEBHOOK_SECRET (optional) - For webhook verification

## Deployment URLs:
- Backend: https://project-buzzv1-2.onrender.com
- Frontend: https://project-buzz-v.vercel.app
- Domain: https://projectbuzz.tech

## Safety Measures:
1. Keep test environment for development
2. Backup current configuration
3. Test thoroughly before going live
4. Monitor transactions closely
5. Have rollback plan ready

## Post-Migration Checklist:
- [ ] Live payments working
- [ ] Webhook receiving events
- [ ] Payment verification working
- [ ] Email notifications working
- [ ] Dashboard showing live transactions
- [ ] Error handling working
- [ ] Refund process (if needed)
