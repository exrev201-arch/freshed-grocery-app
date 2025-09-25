# 🔐 Environment Variables Configuration Template

Fill in your actual values below, then use them when configuring your Render services.

## 📦 Backend Service (`freshed-grocery-backend`)

### Database Configuration
```
DATABASE_URL= # Your MongoDB connection string (e.g., mongodb+srv://username:password@cluster.mongodb.net/freshed_grocery)
```

### JWT Secrets (Generate strong random strings)
```
JWT_SECRET= # Generate a strong random string (32+ characters)
JWT_REFRESH_SECRET= # Generate another strong random string (32+ characters)
```

### Email Configuration (For OTP and notifications)
```
SMTP_USER= # Your SMTP username (e.g., your-email@gmail.com or API key)
SMTP_PASS= # Your SMTP password or app password
FROM_EMAIL=Freshed Grocery <noreply@freshed.co.tz>
```

### Server Configuration
```
PORT=10000
NODE_ENV=production
CORS_ORIGIN=https://freshed-grocery-frontend.onrender.com
```

### Admin Configuration (Set your admin credentials)
```
DEFAULT_ADMIN_EMAIL=admin@freshed.co.tz
DEFAULT_ADMIN_NAME=Freshed Admin
DEFAULT_ADMIN_PASSWORD= # Set a strong admin password
```

## 🌐 Frontend Service (`freshed-grocery-frontend`)

### Application Configuration
```
VITE_APP_URL=https://freshed-grocery-frontend.onrender.com
VITE_APP_NAME=Freshed Grocery Tanzania
```

### ClickPesa Payment Gateway Configuration
```
VITE_CLICKPESA_API_KEY= # Your actual ClickPesa API key
VITE_CLICKPESA_MERCHANT_ID= # Your ClickPesa merchant ID
VITE_CLICKPESA_PAY_BILL_NUMBER= # Your ClickPesa pay bill number
VITE_CLICKPESA_BASE_URL=https://api.clickpesa.com
VITE_CLICKPESA_WEBHOOK_SECRET= # Generate a webhook secret (random string)
VITE_CLICKPESA_DEMO_MODE=false
```

### Admin Access Configuration
```
VITE_ADMIN_EMAIL=admin@freshed.co.tz
VITE_ADMIN_PASSWORD= # Same as backend admin password
```

## 🎯 Instructions

1. Fill in all the values above with your actual credentials
2. When deploying to Render, set these as Environment Variables in the Render dashboard
3. For security, never commit these values to version control
4. Generate strong passwords and secrets using a password manager

## 🔧 Tools to Generate Secure Secrets

### JWT Secrets Generator (Example)
You can use this command in terminal to generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or use online password generators with 32+ characters:
- [https://passwordsgenerator.net/](https://passwordsgenerator.net/)
- [https://www.lastpass.com/password-generator](https://www.lastpass.com/password-generator)

## 📝 Notes

- Keep this file secure and never commit it to GitHub
- Store your actual values in a secure password manager
- Regenerate secrets periodically for security
- Test all credentials before deployment

---
**Remember**: These are sensitive credentials. Keep them secure and never share them publicly.