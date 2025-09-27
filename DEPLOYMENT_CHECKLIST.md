# 🚀 Freshed Grocery App - Deployment Checklist

This checklist ensures you've completed all necessary steps for deploying your Freshed Grocery application to Render.

## 🔧 Pre-Deployment Checklist

### Repository Setup
- [ ] Repository is on GitHub and up-to-date
- [ ] [render.yaml](file:///C:/Users/PC/Documents/freshed/render.yaml) file is in the root directory
- [ ] All required files are present:
  - [ ] [package.json](file:///C:/Users/PC/Documents/freshed/package.json) (frontend)
  - [ ] [backend/package.json](file:///C:/Users/PC/Documents/freshed/backend/package.json)
  - [ ] [vite.config.ts](file:///C:/Users/PC/Documents/freshed/vite.config.ts)
  - [ ] [backend/start.js](file:///C:/Users/PC/Documents/freshed/backend/start.js)
  - [ ] [backend/src/server.ts](file:///C:/Users/PC/Documents/freshed/backend/src/server.ts)

### Environment Preparation
- [ ] MongoDB Atlas cluster is created and accessible
- [ ] ClickPesa merchant account is set up
- [ ] SendGrid account is created with API key
- [ ] Domain names are registered (if using custom domains)

### Security
- [ ] Generated secure JWT secrets:
  ```bash
  npm run generate:secrets
  ```
- [ ] Changed default admin password from "Swordfish_1234"
- [ ] Verified all API keys are valid and have proper permissions

## ☁️ Render Deployment

### Frontend Service
- [ ] Created Web Service on Render
- [ ] Connected to GitHub repository
- [ ] Configuration:
  - **Name**: `freshed-grocery-frontend`
  - **Environment**: Node
  - **Build Command**: `npm install && npm run build`
  - **Start Command**: `npm run preview`
- [ ] Environment Variables Added:
  - [ ] `VITE_APP_URL=https://your-frontend-url.onrender.com`
  - [ ] `VITE_APP_NAME="Freshed Grocery Tanzania"`
  - [ ] `VITE_CLICKPESA_API_KEY=your_actual_key`
  - [ ] `VITE_CLICKPESA_MERCHANT_ID=your_merchant_id`
  - [ ] `VITE_CLICKPESA_PAY_BILL_NUMBER=1804`
  - [ ] `VITE_CLICKPESA_BASE_URL=https://api.clickpesa.com`
  - [ ] `VITE_CLICKPESA_WEBHOOK_SECRET=your_secure_secret`
  - [ ] `VITE_CLICKPESA_DEMO_MODE=false`
  - [ ] `VITE_ADMIN_EMAIL=admin@freshed.co.tz`
  - [ ] `VITE_ADMIN_PASSWORD=your_secure_password`

### Backend Service
- [ ] Created Web Service on Render
- [ ] Connected to same GitHub repository
- [ ] Configuration:
  - **Name**: `freshed-grocery-backend`
  - **Environment**: Node
  - **Build Command**: `npm install && cd backend && npm install`
  - **Start Command**: `cd backend && npm start`
- [ ] Environment Variables Added:
  - [ ] `DATABASE_URL=your_mongodb_connection_string`
  - [ ] `JWT_SECRET=your_generated_secret`
  - [ ] `JWT_REFRESH_SECRET=your_generated_refresh_secret`
  - [ ] `SMTP_USER=apikey`
  - [ ] `SMTP_PASS=your_sendgrid_api_key`
  - [ ] `FROM_EMAIL=Freshed Grocery <noreply@freshed.co.tz>`
  - [ ] `PORT=10000`
  - [ ] `NODE_ENV=production`
  - [ ] `CORS_ORIGIN=https://your-frontend-url.onrender.com`
  - [ ] `DEFAULT_ADMIN_EMAIL=admin@freshed.co.tz`
  - [ ] `DEFAULT_ADMIN_NAME=Freshed`
  - [ ] `DEFAULT_ADMIN_PASSWORD=your_secure_password`
  - [ ] `CLICKPESA_WEBHOOK_SECRET=your_clickpesa_secret`

## 🔍 Post-Deployment Verification

### Application Functionality
- [ ] Frontend loads at `https://your-frontend-url.onrender.com`
- [ ] Backend API accessible at `https://your-backend-url.onrender.com`
- [ ] User registration works
- [ ] User login works
- [ ] Product catalog displays
- [ ] Shopping cart functions
- [ ] Checkout process works
- [ ] ClickPesa payment integration works
- [ ] Admin dashboard accessible at `/admin`
- [ ] Email notifications sent

### Security Checks
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] No sensitive information in logs
- [ ] Environment variables are correctly used

### Performance
- [ ] Application loads within acceptable time
- [ ] Images are optimized
- [ ] No console errors in browser

## 🛠️ Troubleshooting

### Common Issues

1. **Frontend Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are correctly listed in [package.json](file:///C:/Users/PC/Documents/freshed/package.json)

2. **Backend Startup Failures**
   - Verify database connection string
   - Check environment variables in Render dashboard
   - Review logs for missing dependencies

3. **CORS Errors**
   - Ensure `CORS_ORIGIN` matches frontend URL exactly
   - Check if URL includes `https://`

4. **Database Connection Issues**
   - Verify MongoDB Atlas IP whitelist includes Render IPs
   - Check database credentials

5. **Email Delivery Problems**
   - Verify SendGrid API key
   - Check sender authentication in SendGrid

### Monitoring

- [ ] Set up uptime monitoring
- [ ] Configure error tracking
- [ ] Set up performance monitoring

## 📈 Post-Launch Tasks

### Analytics
- [ ] Set up Google Analytics
- [ ] Configure conversion tracking
- [ ] Implement user behavior tracking

### SEO
- [ ] Submit sitemap to search engines
- [ ] Verify robots.txt
- [ ] Set up structured data

### Marketing
- [ ] Configure social media integration
- [ ] Set up email marketing platform
- [ ] Create social sharing features

## 🆘 Support Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [ClickPesa API Documentation](https://clickpesa.com/developer)
- [SendGrid Documentation](https://sendgrid.com/docs/)

## 📅 Maintenance Schedule

- [ ] Weekly: Check application logs
- [ ] Monthly: Review security settings
- [ ] Quarterly: Update dependencies
- [ ] Annually: Review and rotate secrets

---

✅ **Deployment Status**: Ready for Production  
📅 **Prepared Date**: September 24, 2025  
👨‍💻 **Prepared By**: Qoder AI Assistant