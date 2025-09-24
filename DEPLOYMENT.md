# Deployment Guide for Freshed Grocery App

## Render Deployment Configuration

This application is configured for deployment to Render using the `render.yaml` configuration file.

## Services

The application consists of two services:

1. **Frontend Service** - Vite React application
2. **Backend Service** - Express API server

## Environment Variables

### Frontend (.env)
The frontend requires the following environment variables:

```
VITE_APP_URL=https://freshed-grocery-frontend.onrender.com
VITE_APP_NAME="Freshed Grocery Tanzania"
VITE_CLICKPESA_API_KEY=your_clickpesa_api_key
VITE_CLICKPESA_MERCHANT_ID=your_clickpesa_merchant_id
VITE_CLICKPESA_PAY_BILL_NUMBER=your_clickpesa_pay_bill_number
VITE_CLICKPESA_BASE_URL=https://api.clickpesa.com
VITE_CLICKPESA_WEBHOOK_SECRET=your_webhook_secret
VITE_CLICKPESA_DEMO_MODE=false
VITE_ADMIN_EMAIL=admin@freshed.co.tz
VITE_ADMIN_PASSWORD=your_secure_admin_password
```

### Backend (.env)
The backend requires the following environment variables:

```
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
FROM_EMAIL=Freshed Grocery <noreply@freshed.co.tz>
PORT=10000
NODE_ENV=production
CORS_ORIGIN=https://freshed-grocery-frontend.onrender.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
OTP_EXPIRES_IN_MINUTES=5
OTP_LENGTH=6
DEFAULT_ADMIN_EMAIL=admin@freshed.co.tz
DEFAULT_ADMIN_NAME=Freshed Admin
DEFAULT_ADMIN_PASSWORD=your_admin_password
```

## Deployment Steps

1. Push your code to your GitHub repository
2. Connect your GitHub repository to Render
3. Render will automatically detect the `render.yaml` file and deploy both services
4. Set the required environment variables in the Render dashboard for both services
5. The application will be available at `https://freshed-grocery-frontend.onrender.com`

## Notes

- The frontend service is configured as a static site that serves the built React application
- The backend service is a Node.js web service that runs the Express API
- CORS is configured to allow requests from the frontend domain
- The frontend is configured to proxy API requests to the backend service