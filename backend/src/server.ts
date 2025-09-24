import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { logger } from './utils/logger';

// Initialize Express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // List of allowed origins
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5175',
        'https://fresh-grocery-frontend.onrender.com',
        'https://fresh-grocery-frontend.onrender.com/'
      ];
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5175',
      'https://fresh-grocery-frontend.onrender.com',
      'https://fresh-grocery-frontend.onrender.com/'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('User connected', 'SOCKET', { socketId: socket.id });

  // Join user to their personal room for order updates
  socket.on('join_user_room', (userId: string) => {
    socket.join(`user_${userId}`);
    logger.info('User joined their room', 'SOCKET', { userId, socketId: socket.id });
  });

  // Join admin to admin room for real-time dashboard updates
  socket.on('join_admin_room', () => {
    socket.join('admin_room');
    logger.info('Admin joined admin room', 'SOCKET', { socketId: socket.id });
  });

  socket.on('disconnect', () => {
    logger.info('User disconnected', 'SOCKET', { socketId: socket.id });
  });
});

// Make io instance available to routes
app.set('io', io);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`Fresh Grocery Backend API running on port ${PORT}`, 'SERVER');
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`, 'SERVER');
  logger.info(`CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5175'}`, 'SERVER');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.warn('SIGTERM received, shutting down gracefully', 'SERVER');
  server.close(() => {
    logger.info('Process terminated', 'SERVER');
  });
});

export { io };