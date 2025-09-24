import { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

// Validation middleware
const otpRequestValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  validateRequest
];

const otpVerifyValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('OTP code must be 6 digits'),
  validateRequest
];

const adminLoginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password is required'),
  validateRequest
];

const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('phone').optional().isMobilePhone('any'),
  body('address').optional().trim().isLength({ min: 5, max: 500 }),
  body('preferences').optional().isObject(),
  validateRequest
];

// Generate OTP code
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate JWT token
const generateToken = (payload: object): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' } as any);
};

// POST /api/auth/send-otp - Send OTP for user authentication
router.post('/send-otp', otpRequestValidation, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Generate OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Clean up expired OTP codes for this email
    await prisma.otpCode.deleteMany({
      where: {
        email,
        OR: [
          { expiresAt: { lt: new Date() } },
          { used: true }
        ]
      }
    });

    // Save OTP to database
    await prisma.otpCode.create({
      data: {
        email,
        code,
        expiresAt,
        used: false
      }
    });

    // In production, send actual email/SMS here
    if (process.env.NODE_ENV === 'development') {
      logger.info(`OTP sent to ${email}: ${code}`, 'AUTH');
      console.log(`🔐 Development Mode - OTP for ${email}: ${code}`);
    }

    // TODO: Integrate with email/SMS service
    // await sendOTPEmail(email, code);
    // await sendOTPSMS(phone, code);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      email,
      // Remove in production
      ...(process.env.NODE_ENV === 'development' && { devCode: code })
    });
  } catch (error: any) {
    logger.error('Error sending OTP', 'AUTH', { error: error.message, email: req.body.email });
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP',
      message: error.message
    });
  }
});

// POST /api/auth/verify-otp - Verify OTP and authenticate user
router.post('/verify-otp', otpVerifyValidation, async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    // Find valid OTP
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP'
      });
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true }
    });

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0] || 'Fresh User',
          isActive: true,
          profile: {
            create: {
              // Initialize with empty profile
            }
          }
        },
        include: { profile: true }
      });

      logger.info('New user created', 'AUTH', { userId: user.id, email });
    } else if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Update last login (optional field, so we don't need to worry about it in schema)
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { userId: user.id }
    });

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: 'USER'
    });

    logger.info('User authenticated successfully', 'AUTH', { userId: user.id, email });

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        preferences: user.preferences,
        profile: user.profile
      }
    });
  } catch (error: any) {
    logger.error('Error verifying OTP', 'AUTH', { error: error.message, email: req.body.email });
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP',
      message: error.message
    });
  }
});

// POST /api/auth/admin/login - Admin login with email/password
router.post('/admin/login', adminLoginValidation, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find admin user
    const admin = await prisma.adminUser.findUnique({
      where: { email }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: admin.role
    });

    logger.info('Admin authenticated successfully', 'AUTH', { 
      adminId: admin.id, 
      email: admin.email, 
      role: admin.role 
    });

    res.json({
      success: true,
      message: 'Admin authentication successful',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error: any) {
    logger.error('Error in admin login', 'AUTH', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to authenticate admin',
      message: error.message
    });
  }
});

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', async (req: Request, res: Response) => {
  try {
    // In a more advanced implementation, you might want to:
    // 1. Blacklist the token
    // 2. Store logout event
    // 3. Clear any server-side sessions

    logger.info('User logged out', 'AUTH');

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    logger.error('Error in logout', 'AUTH', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to logout',
      message: error.message
    });
  }
});

// GET /api/auth/profile - Get current user profile (requires authentication)
router.get('/profile', async (req: Request, res: Response) => {
  try {
    // This would typically use authentication middleware
    // For now, we'll return a simple response
    res.json({
      success: true,
      message: 'Profile endpoint - requires authentication middleware'
    });
  } catch (error: any) {
    logger.error('Error fetching profile', 'AUTH', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
});

// PUT /api/auth/profile - Update user profile (requires authentication)
router.put('/profile', updateProfileValidation, async (req: Request, res: Response) => {
  try {
    // This would typically use authentication middleware
    // For now, we'll return a simple response
    res.json({
      success: true,
      message: 'Profile update endpoint - requires authentication middleware'
    });
  } catch (error: any) {
    logger.error('Error updating profile', 'AUTH', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

// POST /api/auth/refresh - Refresh JWT token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token required'
      });
    }

    try {
      // Verify the token (even if expired)
      const decoded = jwt.verify(token, process.env.JWT_SECRET!, { ignoreExpiration: true }) as any;
      
      // Generate new token
      const newToken = generateToken({
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      });

      res.json({
        success: true,
        token: newToken,
        message: 'Token refreshed successfully'
      });
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  } catch (error: any) {
    logger.error('Error refreshing token', 'AUTH', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token',
      message: error.message
    });
  }
});

export default router;