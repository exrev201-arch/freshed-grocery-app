# 📋 Freshed Grocery App - Deployment Checklist

Before deploying to Render, ensure you have all the following information ready:

## ✅ Pre-Deployment Requirements

### 1. Database Configuration
- [ ] MongoDB connection string
  - Option A: MongoDB Atlas account and cluster
  - Option B: Local MongoDB (not recommended for production)
  - Option C: Render MongoDB service

### 2. Authentication Secrets
- [ ] JWT_SECRET (32+ character random string)
- [ ] JWT_REFRESH_SECRET (32+ character random string)
- [ ] Generate using `GENERATE_SECRETS.ps1` or online password generator

### 3. Email Configuration
- [ ] SMTP provider account (Gmail, SendGrid, Mailgun, etc.)
- [ ] SMTP_USER (email address or API key)
- [ ] SMTP_PASS (app password or API secret)
- [ ] Test email sending capability

### 4. ClickPesa Configuration
- [ ] ClickPesa Merchant Account
- [ ] VITE_CLICKPESA_API_KEY
- [ ] VITE_CLICKPESA_MERCHANT_ID
- [ ] VITE_CLICKPESA_PAY_BILL_NUMBER
- [ ] Test payment processing in sandbox mode

### 5. Admin Credentials
- [ ] DEFAULT_ADMIN_EMAIL (e.g., admin@freshed.co.tz)
- [ ] DEFAULT_ADMIN_NAME (e.g., Freshed Admin)
- [ ] DEFAULT_ADMIN_PASSWORD (strong password)
- [ ] VITE_ADMIN_EMAIL (same as above)
- [ ] VITE_ADMIN_PASSWORD (same as above)

## 🚀 Render Deployment Checklist

### Backend Service (`freshed-grocery-backend`)
- [ ] DATABASE_URL
- [ ] JWT_SECRET
- [ ] JWT_REFRESH_SECRET
- [ ] SMTP_USER
- [ ] SMTP_PASS
- [ ] FROM_EMAIL=Freshed Grocery <noreply@freshed.co.tz>
- [ ] PORT=10000
- [ ] NODE_ENV=production
- [ ] CORS_ORIGIN=https://freshed-grocery-frontend.onrender.com
- [ ] DEFAULT_ADMIN_EMAIL
- [ ] DEFAULT_ADMIN_NAME
- [ ] DEFAULT_ADMIN_PASSWORD

### Frontend Service (`freshed-grocery-frontend`)
- [ ] VITE_APP_URL=https://freshed-grocery-frontend.onrender.com
- [ ] VITE_APP_NAME=Freshed Grocery Tanzania
- [ ] VITE_CLICKPESA_API_KEY
- [ ] VITE_CLICKPESA_MERCHANT_ID
- [ ] VITE_CLICKPESA_PAY_BILL_NUMBER
- [ ] VITE_CLICKPESA_BASE_URL=https://api.clickpesa.com
- [ ] VITE_CLICKPESA_WEBHOOK_SECRET (generate secure secret)
- [ ] VITE_CLICKPESA_DEMO_MODE=false
- [ ] VITE_ADMIN_EMAIL
- [ ] VITE_ADMIN_PASSWORD

## 🔧 Testing Before Deployment

### 1. Local Testing
- [ ] Application builds successfully (`npm run build`)
- [ ] All environment variables are properly configured locally
- [ ] Database connection works
- [ ] Email sending works
- [ ] ClickPesa API integration works (in sandbox mode)

### 2. Security Check
- [ ] No sensitive information in code repositories
- [ ] .env files are in .gitignore
- [ ] Strong passwords and secrets generated
- [ ] Admin credentials are secure

## 📞 Support Contacts

### Database Support
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Render Database: https://docs.render.com/deploy-mongodb

### Email Providers
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- SendGrid: https://sendgrid.com/
- Mailgun: https://www.mailgun.com/

### Payment Processing
- ClickPesa Documentation: https://clickpesa.com/developers
- ClickPesa Support: https://clickpesa.com/contact

### Deployment Platform
- Render Documentation: https://render.com/docs
- Render Support: https://render.com/help

## 🎯 Success Criteria

After deployment, verify:
- [ ] Application accessible at https://freshed-grocery-frontend.onrender.com
- [ ] PWA features working (install, offline, push notifications)
- [ ] User registration and login functional
- [ ] Product catalog displays correctly
- [ ] Shopping cart and checkout working
- [ ] ClickPesa payments processing
- [ ] Admin dashboard accessible
- [ ] Email notifications being sent
- [ ] All environment variables correctly configured

## 📝 Important Notes

1. **Security**: Never commit sensitive credentials to version control
2. **Backup**: Ensure database backup strategy is in place
3. **Monitoring**: Set up uptime monitoring and error tracking
4. **SSL**: Render provides SSL certificates automatically
5. **Scaling**: Monitor resource usage and plan for scaling

---
**Prepared By**: Qoder AI Assistant  
**Date**: September 24, 2025  
**Status**: ✅ READY FOR PRODUCTION DEPLOYMENT