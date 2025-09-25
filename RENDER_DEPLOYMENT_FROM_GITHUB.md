# 🚀 Deploy Freshed Grocery App from GitHub to Render

Since you've already pushed your code to GitHub, you can now deploy directly to Render.

## 🔄 What We've Updated

Before deploying, we've made these important updates to your codebase:
- All references changed from "fresh" to "freshed" throughout the application
- Service names in `render.yaml` updated to `freshed-grocery-frontend` and `freshed-grocery-backend`
- Email addresses updated to use `@freshed.co.tz`
- Environment variables configured for proper deployment

## 🚀 Deploy to Render

### Step 1: Connect GitHub to Render

1. Go to https://dashboard.render.com
2. If you haven't already, connect your GitHub account
3. Click "New" → "Web Service"

### Step 2: Select Your Repository

1. Find and select your `freshed-grocery-app` repository
2. Render will automatically detect the `render.yaml` file
3. Review the detected services:
   - Frontend: `freshed-grocery-frontend` (Static Site)
   - Backend: `freshed-grocery-backend` (Web Service)

### Step 3: Configure Environment Variables

#### Frontend Service (`freshed-grocery-frontend`):
Set these in the Render dashboard under the frontend service settings:
```
VITE_APP_URL=https://freshed-grocery-frontend.onrender.com
VITE_APP_NAME="Freshed Grocery Tanzania"
VITE_CLICKPESA_API_KEY=your_actual_clickpesa_api_key
VITE_CLICKPESA_MERCHANT_ID=your_merchant_id
VITE_CLICKPESA_PAY_BILL_NUMBER=your_pay_bill_number
VITE_CLICKPESA_DEMO_MODE=false
VITE_ADMIN_EMAIL=admin@freshed.co.tz
VITE_ADMIN_PASSWORD=your_secure_admin_password
```

#### Backend Service (`freshed-grocery-backend`):
Set these in the Render dashboard under the backend service settings:
```
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_random_jwt_secret_string
JWT_REFRESH_SECRET=your_random_jwt_refresh_secret_string
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
FROM_EMAIL=Freshed Grocery <noreply@freshed.co.tz>
PORT=10000
NODE_ENV=production
CORS_ORIGIN=https://freshed-grocery-frontend.onrender.com
DEFAULT_ADMIN_EMAIL=admin@freshed.co.tz
DEFAULT_ADMIN_NAME=Freshed Admin
DEFAULT_ADMIN_PASSWORD=your_admin_password
```

### Step 4: Deploy Services

1. Click "Apply" to start the deployment process
2. Monitor the build logs for both services:
   - Frontend service: `freshed-grocery-frontend`
   - Backend service: `freshed-grocery-backend`
3. Wait for both services to deploy successfully (this may take 5-10 minutes)

### Step 5: Test Your Deployed Application

1. Visit your frontend URL: `https://freshed-grocery-frontend.onrender.com`
2. Test all functionality:
   - User registration and login
   - Product browsing and search
   - Shopping cart operations
   - Checkout process
   - ClickPesa payment integration
   - Admin dashboard access
   - PWA features (install prompt, offline support)

## 📋 Post-Deployment Checklist

- [ ] Application loads correctly at `https://freshed-grocery-frontend.onrender.com`
- [ ] PWA install prompt appears on mobile devices
- [ ] User registration and login work
- [ ] Product catalog displays correctly
- [ ] Shopping cart functionality works
- [ ] Checkout process completes successfully
- [ ] ClickPesa payments process correctly
- [ ] Admin dashboard is accessible
- [ ] All environment variables are properly configured
- [ ] Database connections are working
- [ ] Email notifications are sent

## 🛠️ Troubleshooting Common Issues

### 1. CORS Errors
- Ensure `CORS_ORIGIN` in backend matches your frontend URL
- Check that both services are deployed successfully

### 2. Database Connection Issues
- Verify `DATABASE_URL` format and credentials
- Ensure your database service is accessible from Render

### 3. ClickPesa Payment Failures
- Confirm API keys are correct
- Verify your ClickPesa account is activated
- Check that `VITE_CLICKPESA_DEMO_MODE` is set to `false` for production

### 4. Build Failures
- Check build logs for specific error messages
- Ensure all required environment variables are set

## 📞 Support Resources

- Render Documentation: https://render.com/docs
- ClickPesa Integration Guide: https://clickpesa.com/developers
- GitHub Repository: Your existing `freshed-grocery-app` repo

## 🎯 Success Metrics

Your deployment is successful when you can:
1. Access the application at `https://freshed-grocery-frontend.onrender.com`
2. Register a new user account
3. Browse products and add items to cart
4. Complete a checkout process
5. Access the admin dashboard with admin credentials
6. See PWA features working (install prompt, offline support)

---

**Prepared By**: Qoder AI Assistant  
**Date**: September 24, 2025  
**Status**: ✅ READY FOR PRODUCTION DEPLOYMENT

Your Freshed Grocery application is now ready to be deployed from GitHub to Render!