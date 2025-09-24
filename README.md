# Fresh Grocery Tanzania 🥦

A modern grocery delivery platform for Tanzania with ClickPesa payment integration.

## 🌟 Features

- **PWA Ready**: Installable on mobile devices with offline support
- **Mobile Money Payments**: Integrated with ClickPesa for M-Pesa, Airtel Money, and Tigo Pesa
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Admin Dashboard**: Full-featured admin panel for managing products, orders, and users
- **Real-time Updates**: Live order tracking and notifications
- **Multi-language**: English and Swahili support
- **Dark Mode**: Automatic theme switching based on system preferences

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast builds
- Tailwind CSS for styling
- Zustand for state management
- React Router for navigation
- Lucide React for icons

### Backend
- Node.js with Express
- MongoDB with Prisma ORM
- JWT for authentication
- Socket.IO for real-time communication

### Payment Integration
- ClickPesa API for mobile money payments
- Support for M-Pesa, Airtel Money, Tigo Pesa
- Card payments (Visa, Mastercard)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/fresh-grocery-tz.git
cd fresh-grocery-tz
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

4. Set up environment variables (see .env.example files)

5. Start the development servers:
```bash
# Frontend
npm run dev

# Backend (in a separate terminal)
cd backend
npm run dev
```

## 📱 PWA Features

The application is a full-featured Progressive Web App with:
- Installable on mobile devices
- Offline support with service workers
- Push notifications
- Background sync
- Add to Home Screen prompt
- Standalone app-like experience

## 💳 Payment Integration

### ClickPesa Setup
1. Create a ClickPesa merchant account
2. Obtain API credentials
3. Configure environment variables:
   - VITE_CLICKPESA_API_KEY
   - VITE_CLICKPESA_MERCHANT_ID
   - VITE_CLICKPESA_PAY_BILL_NUMBER

### Supported Payment Methods
- M-Pesa (Vodacom)
- Airtel Money
- Tigo Pesa
- Credit/Debit Cards (Visa, Mastercard)
- Cash on Delivery

## 🚢 Deployment

### Render Deployment
The application is configured for deployment to Render with automatic CI/CD.

1. Push code to GitHub
2. Connect to Render
3. Configure environment variables
4. Deploy services

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Environment Variables
See [.env.example](.env.example) for required frontend variables and [backend/.env.example](backend/.env.example) for backend variables.

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Code Quality
```bash
npm run lint
npm run format
```

## 📖 Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment instructions
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Deployment verification checklist
- [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) - Deployment overview

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- ClickPesa for payment integration
- All the open-source libraries and tools used in this project
- The Tanzanian developer community

## 📞 Support

For support, please open an issue on GitHub or contact the maintainers.