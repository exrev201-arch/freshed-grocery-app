# Fresh Grocery Backend API

A modern Express.js backend API to replace @devvai/devv-code-backend dependency.

## Features

- **Authentication**: JWT-based auth with OTP verification
- **Database**: PostgreSQL with proper relationships
- **Real-time**: WebSocket for order updates
- **Security**: CORS, rate limiting, input validation
- **Admin**: Role-based access control
- **API**: RESTful endpoints with pagination

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + OTP via email
- **Real-time**: Socket.io
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate limiting

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products (with pagination)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Get admin users
- `POST /api/admin/users` - Create admin user
- `GET /api/admin/orders` - Get all orders (admin only)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/favorites` - Get user favorites
- `POST /api/users/favorites` - Add to favorites
- `DELETE /api/users/favorites/:id` - Remove from favorites

## Database Schema

See `prisma/schema.prisma` for complete database schema.

## Setup Instructions

1. Install dependencies: `npm install`
2. Setup PostgreSQL database
3. Configure environment variables in `.env`
4. Run migrations: `npx prisma migrate dev`
5. Start server: `npm run dev`

## Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/fresh_grocery"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
PORT=3001
CORS_ORIGIN="http://localhost:5175"
```