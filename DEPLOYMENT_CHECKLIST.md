# Deployment Checklist for Freshed Grocery App

## ✅ Pre-deployment Checks

### 1. Code Repository
- [ ] All code is committed and pushed to GitHub
- [ ] No sensitive information in code (API keys, passwords, etc.)
- [ ] .env files are in .gitignore
- [ ] README.md is up to date

### 2. Configuration Files
- [ ] render.yaml exists and is correctly configured
- [ ] Environment variables are documented
- [ ] Database migration scripts are ready (if applicable)

### 3. Build Process
- [ ] Application builds successfully (`npm run build`)
- [ ] No critical TypeScript errors
- [ ] All assets are properly bundled
- [ ] Service workers are correctly configured

### 4. Testing
- [ ] Core functionality tested (checkout, payment, admin)
- [ ] PWA features work correctly
- [ ] Responsive design on mobile devices
- [ ] Performance is acceptable

## 🚀 Deployment Steps

### 1. Connect to Render
1. Go to https://dashboard.render.com
2. Connect your GitHub account
3. Select your repository
4. Render should automatically detect render.yaml

### 2. Configure Services
#### Frontend Service
- Service name: freshed-grocery-frontend
- Environment: Static Site
- Build command: `npm run build`
- Publish directory: `./dist`
- Environment variables:
  - VITE_APP_URL=https://freshed-grocery-frontend.onrender.com
  - VITE_CLICKPESA_API_KEY=your_actual_key
  - VITE_CLICKPESA_MERCHANT_ID=your_merchant_id
  - VITE_CLICKPESA_PAY_BILL_NUMBER=your_pay_bill_number
  - VITE_CLICKPESA_DEMO_MODE=false
  - VITE_ADMIN_EMAIL=admin@freshed.co.tz
  - VITE_ADMIN_PASSWORD=your_secure_password

#### Backend Service
- Service name: freshed-grocery-backend
- Environment: Node
- Build command: `cd backend && npm install && npm run build`
- Start command: `cd backend && npm start`
- Environment variables:
  - DATABASE_URL=your_database_connection_string
  - JWT_SECRET=your_jwt_secret
  - JWT_REFRESH_SECRET=your_refresh_secret
  - SMTP_USER=your_smtp_user
  - SMTP_PASS=your_smtp_password
  - CORS_ORIGIN=https://freshed-grocery-frontend.onrender.com

### 3. Deploy
1. Click "Create Web Services" in Render
2. Wait for deployment to complete
3. Check logs for any errors
4. Test the deployed application

## 🔍 Post-deployment Verification

### 1. Frontend Verification
- [ ] Application loads correctly
- [ ] All pages are accessible
- [ ] PWA features work (install, offline, push notifications)
- [ ] ClickPesa integration works
- [ ] Images and assets load properly

### 2. Backend Verification
- [ ] API endpoints respond correctly
- [ ] Database connections work
- [ ] Authentication functions properly
- [ ] Email notifications are sent

### 3. Integration Testing
- [ ] User can register/login
- [ ] Products display correctly
- [ ] Cart functionality works
- [ ] Checkout process completes
- [ ] Orders are created successfully
- [ ] Admin dashboard is accessible

## 🛠️ Troubleshooting

### Common Issues
1. **CORS Errors**: Check CORS_ORIGIN configuration
2. **Environment Variables**: Verify all required variables are set
3. **Database Connection**: Check DATABASE_URL and credentials
4. **Build Failures**: Check build logs for specific errors
5. **Service Worker Issues**: Verify sw-enhanced.js is properly configured

### Support
- Render Support: https://render.com/help
- ClickPesa Support: https://clickpesa.com/contact
- GitHub Issues: https://github.com/your-repo/issues

## 📈 Monitoring and Maintenance

### 1. Monitoring
- Set up uptime monitoring
- Configure error tracking
- Monitor performance metrics

### 2. Maintenance
- Regular security updates
- Database backups
- Performance optimization
- Feature updates

### 3. Scaling
- Monitor resource usage
- Configure auto-scaling if needed
- Optimize database queries
- Implement caching strategies