# Fresh Grocery Tanzania 🥦

A modern grocery delivery platform for Tanzania with ClickPesa payment integration, ready for deployment to Render.

## 🌟 Features

- **PWA Ready**: Installable on mobile devices with offline support
- **Mobile Money Payments**: Integrated with ClickPesa for M-Pesa, Airtel Money, and Tigo Pesa
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Admin Dashboard**: Full-featured admin panel for managing products, orders, and users
- **Real-time Updates**: Live order tracking and notifications
- **Multi-language**: English and Swahili support

## 🚀 Deployment to Render

This application is configured for deployment to Render with automatic CI/CD.

### Prerequisites
- Render account
- GitHub account
- ClickPesa merchant account
- MongoDB database

### Deployment Steps
1. Fork this repository or push it to your GitHub account
2. Connect your GitHub repository to Render
3. Configure environment variables (see below)
4. Deploy services

### Environment Variables

#### Frontend Variables
```bash
VITE_APP_URL=https://your-app-name.onrender.com
VITE_CLICKPESA_API_KEY=your_clickpesa_api_key
VITE_CLICKPESA_MERCHANT_ID=your_merchant_id
VITE_CLICKPESA_PAY_BILL_NUMBER=your_pay_bill_number
VITE_CLICKPESA_DEMO_MODE=false
VITE_ADMIN_EMAIL=admin@fresh.co.tz
VITE_ADMIN_PASSWORD=your_secure_password
```

#### Backend Variables
```bash
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
FROM_EMAIL=Fresh Grocery <noreply@fresh.co.tz>
PORT=10000
NODE_ENV=production
CORS_ORIGIN=https://your-app-name.onrender.com
```

## 📖 Documentation

For detailed deployment instructions, see:
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)
- [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.