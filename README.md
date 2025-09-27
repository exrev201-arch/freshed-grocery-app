# Freshed Grocery Delivery Platform - Tanzania

Freshed Grocery is a modern e-commerce platform for grocery delivery in Tanzania, featuring ClickPesa mobile money integration for seamless payments.

## 🌟 Features

- **Product Catalog**: Browse and search grocery items with categories
- **Shopping Cart**: Add/remove items and adjust quantities
- **User Authentication**: Secure registration and login with JWT
- **Order Management**: Track order status and history
- **Payment Integration**: ClickPesa mobile money payments (M-Pesa, Airtel Money)
- **Admin Dashboard**: Manage products, orders, and users
- **Responsive Design**: Works on mobile, tablet, and desktop
- **PWA Support**: Installable as a mobile app

## 🚀 Deployment to Render

### Prerequisites

1. [Render](https://render.com) account
2. [GitHub](https://github.com) account with this repository
3. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
4. [ClickPesa](https://clickpesa.com) merchant account
5. [SendGrid](https://sendgrid.com) account for email notifications

### Automated Deployment

This repository includes a [render.yaml](file:///C:/Users/PC/Documents/freshed/render.yaml) file for automated deployment to Render:

1. Fork this repository to your GitHub account
2. Log in to your Render dashboard
3. Click "New" → "Web Service"
4. Connect your GitHub account and select this repository
5. Configure the service:
   - **Name**: `freshed-grocery-frontend`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`
6. Add environment variables (see below)
7. Click "Create Web Service"
8. Repeat for the backend service with:
   - **Name**: `freshed-grocery-backend`
   - **Build Command**: `npm install && cd backend && npm install`
   - **Start Command**: `cd backend && npm start`

### Environment Variables

#### Frontend Variables

Set these in your frontend service environment variables:

```
VITE_APP_URL=https://your-frontend-url.onrender.com
VITE_APP_NAME="Freshed Grocery Tanzania"
VITE_CLICKPESA_API_KEY=your_clickpesa_api_key
VITE_CLICKPESA_MERCHANT_ID=your_clickpesa_merchant_id
VITE_CLICKPESA_PAY_BILL_NUMBER=1804
VITE_CLICKPESA_BASE_URL=https://api.clickpesa.com
VITE_CLICKPESA_WEBHOOK_SECRET=your_secure_webhook_secret
VITE_CLICKPESA_DEMO_MODE=false
VITE_ADMIN_EMAIL=admin@freshed.co.tz
VITE_ADMIN_PASSWORD=your_secure_admin_password
```

#### Backend Variables

Set these in your backend service environment variables:

```
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_generated_jwt_secret
JWT_REFRESH_SECRET=your_generated_refresh_secret
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
FROM_EMAIL=Freshed Grocery <noreply@freshed.co.tz>
PORT=10000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.onrender.com
DEFAULT_ADMIN_EMAIL=admin@freshed.co.tz
DEFAULT_ADMIN_NAME=Freshed
DEFAULT_ADMIN_PASSWORD=your_secure_admin_password
CLICKPESA_WEBHOOK_SECRET=your_clickpesa_webhook_secret
```

### Generating Secure Secrets

To generate secure JWT secrets, run:

```bash
npm run generate:secrets
```

### Manual Deployment Verification

To verify your deployment configuration:

```bash
npm run deploy:verify
```

## 🛠️ Local Development

### Prerequisites

- Node.js 18+
- npm 8+
- MongoDB instance

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/freshed-grocery-app.git
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. Create a [.env](file:///C:/Users/PC/Documents/freshed/.env) file in the root directory with your configuration (see [.env.example](file:///C:/Users/PC/Documents/freshed/.env.example))

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. In a new terminal, start the frontend:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

## 📁 Project Structure

```
freshed-grocery-app/
├── backend/              # Express.js backend API
│   ├── src/              # Backend source code
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Custom middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   ├── prisma/           # Prisma schema and migrations
│   └── start.js          # Backend entry point
├── public/               # Static assets
├── src/                  # Frontend source code
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and services
│   ├── pages/            # Page components
│   └── styles/           # CSS and styling
├── scripts/              # Utility scripts
└── tests/                # Test files
```

## 🔧 Technologies Used

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- React Router
- Zustand (State Management)
- Axios (HTTP Client)
- Framer Motion (Animations)

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma (ORM)
- MongoDB
- JWT (Authentication)
- Nodemailer (Email)
- ClickPesa SDK

## 📱 ClickPesa Integration

This application integrates with ClickPesa for mobile money payments in Tanzania:

- M-Pesa Support
- Airtel Money Support
- Transaction Webhooks
- Payment Status Tracking

## 🔐 Security Features

- JWT-based Authentication
- Password Hashing (bcrypt)
- CORS Protection
- Rate Limiting
- Input Validation
- Environment-based Configuration

## 🎨 UI Components

The application uses a custom component library built with:

- Radix UI primitives
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React icons

## 🧪 Testing

Run tests with:

```bash
# Frontend tests
npm test

# Backend tests
cd backend
npm test
```

## 📚 API Documentation

The backend API is documented with Swagger. Access it at `/api-docs` when running locally.

## 🚀 Performance Optimizations

- Code splitting with Vite
- Image optimization
- Caching strategies
- Database indexing
- Lazy loading components

## 🌐 PWA Features

- Offline support
- Installable on mobile devices
- Push notifications (coming soon)
- Background sync (coming soon)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](file:///C:/Users/PC/Documents/freshed/LICENSE) file for details.

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.

---

**Happy Coding!** 🚀