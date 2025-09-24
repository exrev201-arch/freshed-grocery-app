# GitHub and Render Deployment Guide for Freshed Grocery

This guide will help you push your Fresh Grocery application to GitHub and deploy it to Render.

## Step 1: Initialize Git Repository

### Option A: Using Command Line (if Git is installed)

1. Open Command Prompt or PowerShell in your project directory (`c:\Users\PC\Documents\freshed`)

2. Initialize the Git repository:
```bash
git init
```

3. Add all files to the repository:
```bash
git add .
```

4. Create the initial commit:
```bash
git commit -m "Initial commit: Fresh Grocery App ready for deployment"
```

### Option B: Using GitHub Desktop

1. Open GitHub Desktop
2. Select "Add Local Repository" or "File" → "Add Local Repository"
3. Browse to `c:\Users\PC\Documents\freshed`
4. Click "Add Repository"

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Enter repository name (e.g., "freshed-grocery-app")
3. Choose visibility (Public or Private)
4. Do NOT initialize with README, .gitignore, or license
5. Click "Create repository"

## Step 3: Push Code to GitHub

### Option A: Using Command Line

1. Add the remote origin (replace `your-username` with your GitHub username):
```bash
git remote add origin https://github.com/your-username/freshed-grocery-app.git
```

2. Rename the branch to main:
```bash
git branch -M main
```

3. Push to GitHub:
```bash
git push -u origin main
```

### Option B: Using GitHub Desktop

1. In GitHub Desktop, click "Publish repository"
2. Select your repository name
3. Choose visibility (Public or Private)
4. Click "Publish repository"

## Step 4: Deploy to Render

### Connect GitHub to Render

1. Go to https://dashboard.render.com
2. Click "New" → "Web Service"
3. Connect your GitHub account when prompted
4. Select your repository

### Configure Services

Render will automatically detect the `render.yaml` file and configure both services:

#### Frontend Service
- Service name: fresh-grocery-frontend
- Environment: Static Site
- Build command: `npm run build`
- Publish directory: `./dist`

#### Backend Service
- Service name: fresh-grocery-backend
- Environment: Node
- Build command: `cd backend && npm install && npm run build`
- Start command: `cd backend && npm start`

### Set Environment Variables

#### Frontend Environment Variables
Set these in the Render dashboard under the frontend service settings:
```
VITE_APP_URL=https://your-frontend-service-name.onrender.com
VITE_CLICKPESA_API_KEY=your_actual_clickpesa_api_key
VITE_CLICKPESA_MERCHANT_ID=your_merchant_id
VITE_CLICKPESA_PAY_BILL_NUMBER=your_pay_bill_number
VITE_CLICKPESA_DEMO_MODE=false
VITE_ADMIN_EMAIL=admin@freshed.co.tz
VITE_ADMIN_PASSWORD=your_secure_admin_password
```

#### Backend Environment Variables
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
```

### Deploy Services

1. Click "Apply" to start the deployment process
2. Monitor the build logs for both services
3. Wait for both services to deploy successfully

## Step 5: Test Your Deployed Application

1. Visit your frontend URL (e.g., https://freshed-grocery-frontend.onrender.com)
2. Test all functionality:
   - User registration and login
   - Product browsing
   - Shopping cart
   - Checkout process
   - ClickPesa payment integration
   - Admin dashboard

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `CORS_ORIGIN` in backend matches your frontend URL
2. **Database Connection**: Verify `DATABASE_URL` format and credentials
3. **ClickPesa Payments**: Confirm API keys are correct and account is activated
4. **Build Failures**: Check build logs for specific error messages

### Support Resources

- Render Documentation: https://render.com/docs
- ClickPesa Integration Guide: https://clickpesa.com/developers
- GitHub Help: https://help.github.com

## Next Steps

After successful deployment:

1. Configure custom domain (optional)
2. Set up monitoring and error tracking
3. Implement backup strategies
4. Plan for scaling as your user base grows

---

**Note**: If you continue to have issues with Git commands, you can manually upload your files to GitHub:
1. Download your project as a ZIP file
2. Create a new repository on GitHub
3. Upload the ZIP file using GitHub's web interface
4. Extract and commit the files through the web interface