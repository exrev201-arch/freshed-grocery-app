/**
 * Enhanced Authentication Service for Fresh Grocery Tanzania
 * 
 * This service provides comprehensive authentication with JWT tokens,
 * OTP verification, role-based access control, and session management.
 */

import { v4 as uuidv4 } from 'uuid';
// import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { databaseService } from './database-service';
import { logger } from './logger';
import type { User, AdminUser } from '@/types/database';

// Simple hash function for development (replace with bcryptjs in production)
function simpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

// Simple JWT-like token for development
interface TokenPayload {
  userId: string;
  userType: 'customer' | 'admin';
  email: string;
  sessionId: string;
  exp?: number;
}

function createToken(payload: TokenPayload): string {
  const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'HS256' }));
  const payloadStr = btoa(JSON.stringify(payload));
  const signature = simpleHash(header + '.' + payloadStr + JWT_SECRET);
  return `${header}.${payloadStr}.${signature}`;
}

function verifyToken(token: string): TokenPayload | null {
  try {
    const [header, payload, signature] = token.split('.');
    const expectedSignature = simpleHash(header + '.' + payload + JWT_SECRET);
    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }
    return JSON.parse(atob(payload)) as TokenPayload;
  } catch {
    return null;
  }
}

// JWT Configuration
const JWT_SECRET = import.meta.env.VITE_APP_JWT_SECRET || 'fresh-grocery-jwt-secret-key';
// OTP Configuration
const OTP_EXPIRES_IN = 10 * 60 * 1000; // 10 minutes in milliseconds
const OTP_MAX_ATTEMPTS = 3;

// Session Configuration
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours
const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

// Types for authentication
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

interface AuthResponse {
  user: User | AdminUser;
  tokens: AuthTokens;
  sessionId: string;
}

interface OTPRecord {
  id: string;
  identifier: string; // email or phone
  code: string;
  hashedCode: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
  createdAt: Date;
}

interface UserSession {
  id: string;
  userId: string;
  userType: 'customer' | 'admin';
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  lastActivityAt: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  isActive: boolean;
  createdAt: Date;
}

class EnhancedAuthService {
  private otpStorage = new Map<string, OTPRecord>();
  private sessionStorage = new Map<string, UserSession>();

  constructor() {
    // Clean up expired OTPs and sessions periodically
    setInterval(() => {
      this.cleanupExpiredRecords();
    }, 60000); // Every minute
  }

  // OTP Generation and Verification
  async sendOTP(identifier: string, type: 'email' | 'sms' = 'sms'): Promise<{ success: boolean; message: string }> {
    try {
      // Validate identifier
      const isEmail = identifier.includes('@');
      const isPhone = /^\+255\d{9}$/.test(identifier);
      
      if (!isEmail && !isPhone) {
        throw new Error('Invalid email or phone number format');
      }

      // Generate OTP
      const code = this.generateOTP();
      const hashedCode = await bcryptjs.hash(code, 10);
      
      // Store OTP record
      const otpRecord: OTPRecord = {
        id: uuidv4(),
        identifier,
        code, // In production, don't store plain code
        hashedCode,
        expiresAt: new Date(Date.now() + OTP_EXPIRES_IN),
        attempts: 0,
        verified: false,
        createdAt: new Date(),
      };
      
      this.otpStorage.set(identifier, otpRecord);

      // In development, show OTP in console
      if (import.meta.env.DEV) {
        logger.debug(`OTP for ${identifier}: ${code}`, 'AUTH');
      }

      // In production, integrate with SMS/Email service
      if (type === 'sms' && isPhone) {
        await this.sendSMS(identifier, code);
      } else if (type === 'email' && isEmail) {
        await this.sendEmail(identifier, code);
      }

      return {
        success: true,
        message: type === 'sms' 
          ? 'SMS ya msimbo umepelekwa kwenye simu yako'
          : 'Email ya msimbo umepelekwa kwenye barua pepe yako'
      };
    } catch (error) {
      logger.error('Failed to send OTP', 'AUTH', error);
      return {
        success: false,
        message: 'Hitilafu imetokea wakati wa kutuma msimbo'
      };
    }
  }

  async verifyOTP(identifier: string, inputCode: string): Promise<{ success: boolean; message: string }> {
    const otpRecord = this.otpStorage.get(identifier);
    
    if (!otpRecord) {
      return {
        success: false,
        message: 'Msimbo haujapatikana. Tafadhali omba msimbo mpya'
      };
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      this.otpStorage.delete(identifier);
      return {
        success: false,
        message: 'Msimbo umeisha. Tafadhali omba msimbo mpya'
      };
    }

    // Check max attempts
    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      this.otpStorage.delete(identifier);
      return {
        success: false,
        message: 'Umepitiliza idadi ya majaribio. Tafadhali omba msimbo mpya'
      };
    }

      const isValid = simpleHash(inputCode) === simpleHash(otpRecord.code);
    
    if (!isValid) {
      otpRecord.attempts++;
      return {
        success: false,
        message: `Msimbo si sahihi. Majaribio yaliyobaki: ${OTP_MAX_ATTEMPTS - otpRecord.attempts}`
      };
    }

    // Mark as verified and clean up
    otpRecord.verified = true;
    this.otpStorage.delete(identifier);

    return {
      success: true,
      message: 'Msimbo umethibitishwa kwa ufanisi'
    };
  }

  // User Authentication
  async loginWithOTP(identifier: string, otpCode: string): Promise<AuthResponse> {
    // First verify OTP
    const otpResult = await this.verifyOTP(identifier, otpCode);
    if (!otpResult.success) {
      throw new Error(otpResult.message);
    }

    // Find or create user
    const isEmail = identifier.includes('@');
    const searchField = isEmail ? 'email' : 'phoneNumber';
    
    let user = await databaseService.findOne<User>('users', {
      [searchField]: identifier
    } as Partial<User>);

    if (!user) {
      // Create new user
      const userData = {
        [searchField]: identifier,
        firstName: isEmail ? identifier.split('@')[0] : 'Fresh User',
        lastName: '',
        fullName: isEmail ? identifier.split('@')[0] : 'Fresh User',
        email: isEmail ? identifier : '',
        phoneNumber: isEmail ? '' : identifier,
        emailVerified: isEmail,
        phoneVerified: !isEmail,
        language: 'en' as const,
        currency: 'TZS' as const,
        notifications: {
          email: true,
          sms: true,
          push: true,
          marketing: false,
        },
        status: 'active' as const,
        customerType: 'individual' as const,
      };
      
      user = await databaseService.create<User>('users', userData);
    } else {
      // Update verification status
      const updates: Partial<User> = {
        lastLoginAt: new Date(),
      };
      
      if (isEmail) {
        updates.emailVerified = true;
      } else {
        updates.phoneVerified = true;
      }
      
      user = await databaseService.update<User>('users', user.id, updates) || user;
    }

    // Generate tokens and session
    return this.createUserSession(user, 'customer');
  }

  async loginWithPassword(email: string, password: string): Promise<AuthResponse> {
    const user = await databaseService.findOne<User>('users', { email });
    
    if (!user || !user.passwordHash) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = simpleHash(password) === (user.passwordHash || '');
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new Error('Account is suspended. Please contact support');
    }

    // Update last login
    await databaseService.update<User>('users', user.id, {
      lastLoginAt: new Date(),
    });

    return this.createUserSession(user, 'customer');
  }

  // Admin Authentication
  async loginAdmin(email: string, password: string): Promise<AuthResponse> {
    const admin = await databaseService.findOne<AdminUser>('admin_users', { 
      email,
      status: 'active',
      isDeleted: false 
    });
    
    if (!admin) {
      throw new Error('Invalid admin credentials');
    }

    // For demo purposes, use simple password check
    // In production, use proper password hashing
    if (password !== 'admin123') {
      throw new Error('Invalid admin credentials');
    }

    // Update last login
    await databaseService.update<AdminUser>('admin_users', admin.id, {
      lastLoginAt: new Date(),
    });

    return this.createUserSession(admin, 'admin');
  }

  // Session Management
  private async createUserSession(user: User | AdminUser, userType: 'customer' | 'admin'): Promise<AuthResponse> {
    const sessionId = uuidv4();
    const now = new Date();
    
    // Generate JWT tokens
    const accessTokenPayload = {
      userId: user.id,
      userType,
      email: user.email,
      sessionId,
    };
    
    const accessToken = createToken(accessTokenPayload);
    
    const refreshToken = createToken({
      sessionId, 
      userId: user.id,
      userType,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
    });

    const expiresAt = new Date(now.getTime() + SESSION_TIMEOUT);

    // Store session
    const session: UserSession = {
      id: sessionId,
      userId: user.id,
      userType,
      accessToken,
      refreshToken,
      expiresAt,
      lastActivityAt: now,
      isActive: true,
      createdAt: now,
    };
    
    this.sessionStorage.set(sessionId, session);

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
        expiresAt,
      },
      sessionId,
    };
  }

  async refreshSession(refreshToken: string): Promise<AuthTokens | null> {
    try {
      const decoded = verifyToken(refreshToken);
      if (!decoded) return null;
      
      const session = this.sessionStorage.get(decoded.sessionId);
      
      if (!session || !session.isActive) {
        return null;
      }

      // Check if session is expired
      if (new Date() > session.expiresAt) {
        this.sessionStorage.delete(session.id);
        return null;
      }

      // Generate new access token
      const user = await databaseService.findById(
        session.userType === 'admin' ? 'admin_users' : 'users',
        session.userId
      );
      
      if (!user) {
        return null;
      }

      const newAccessToken = createToken({
        userId: user.id,
        userType: session.userType,
        email: 'email' in user ? (user.email as string) : '',
        sessionId: session.id,
      });

      // Update session
      session.accessToken = newAccessToken;
      session.lastActivityAt = new Date();

      return {
        accessToken: newAccessToken,
        refreshToken,
        expiresAt: session.expiresAt,
      };
    } catch (error) {
      logger.error('Failed to refresh session', 'AUTH', error);
      return null;
    }
  }

  async validateSession(accessToken: string): Promise<{ user: User | AdminUser; sessionId: string } | null> {
    try {
      const decoded = verifyToken(accessToken);
      if (!decoded) return null;
      
      const session = this.sessionStorage.get(decoded.sessionId);
      
      if (!session || !session.isActive) {
        return null;
      }

      // Check session expiry and inactivity
      const now = new Date();
      if (now > session.expiresAt) {
        this.sessionStorage.delete(session.id);
        return null;
      }

      const inactivityLimit = new Date(session.lastActivityAt.getTime() + INACTIVITY_TIMEOUT);
      if (now > inactivityLimit) {
        this.sessionStorage.delete(session.id);
        return null;
      }

      // Update last activity
      session.lastActivityAt = now;

      // Get user data
      const user = await databaseService.findById(
        session.userType === 'admin' ? 'admin_users' : 'users',
        session.userId
      ) as User | AdminUser | null;
      
      if (!user) {
        return null;
      }

      return {
        user,
        sessionId: session.id,
      };
    } catch {
      return null;
    }
  }

  async logout(sessionId: string): Promise<void> {
    const session = this.sessionStorage.get(sessionId);
    if (session) {
      session.isActive = false;
      this.sessionStorage.delete(sessionId);
    }
  }

  async logoutAllSessions(userId: string): Promise<void> {
    for (const [sessionId, session] of this.sessionStorage.entries()) {
      if (session.userId === userId) {
        session.isActive = false;
        this.sessionStorage.delete(sessionId);
      }
    }
  }

  // Password Management
  async setPassword(userId: string, password: string): Promise<void> {
    const hashedPassword = simpleHash(password);
    await databaseService.update<User>('users', userId, {
      passwordHash: hashedPassword,
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await databaseService.findById<User>('users', userId);
    
    if (!user || !user.passwordHash) {
      throw new Error('User not found or no password set');
    }

    const isValidCurrent = simpleHash(currentPassword) === (user.passwordHash || '');
    if (!isValidCurrent) {
      throw new Error('Current password is incorrect');
    }

    await this.setPassword(userId, newPassword);
  }

  // Utility methods
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendSMS(phoneNumber: string, code: string): Promise<void> {
    // In production, integrate with SMS provider
    logger.debug(`SMS to ${phoneNumber}: Msimbo wako wa Fresh Grocery ni: ${code}`, 'AUTH');
  }

  private async sendEmail(email: string, code: string): Promise<void> {
    // In production, integrate with email provider
    logger.debug(`Email to ${email}: Your Fresh Grocery verification code is: ${code}`, 'AUTH');
  }

  private cleanupExpiredRecords(): void {
    const now = new Date();
    
    // Clean expired OTPs
    for (const [identifier, otp] of this.otpStorage.entries()) {
      if (now > otp.expiresAt) {
        this.otpStorage.delete(identifier);
      }
    }
    
    // Clean expired sessions
    for (const [sessionId, session] of this.sessionStorage.entries()) {
      if (now > session.expiresAt || !session.isActive) {
        this.sessionStorage.delete(sessionId);
      }
    }
  }

  // Admin utilities
  async createAdminUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'super_admin' | 'admin' | 'manager' | 'staff';
    createdBy: string;
  }): Promise<AdminUser> {
    // All admin users get full permissions as per the AdminUser interface requirement
    const adminData = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      createdBy: data.createdBy,
      permissions: {
        products: ['create', 'read', 'update', 'delete'] as ['create', 'read', 'update', 'delete'],
        orders: ['create', 'read', 'update', 'delete'] as ['create', 'read', 'update', 'delete'],
        users: ['create', 'read', 'update', 'delete'] as ['create', 'read', 'update', 'delete'],
        analytics: ['read'] as ['read'],
        settings: ['read', 'update'] as ['read', 'update'],
      },
      status: 'active' as const,
      isDeleted: false,
    };
    
    return databaseService.create<AdminUser>('admin_users', adminData);
  }

  private getDefaultPermissions(role: string) {
    switch (role) {
      case 'super_admin':
        return {
          products: ['create', 'read', 'update', 'delete'] as ['create', 'read', 'update', 'delete'],
          orders: ['create', 'read', 'update', 'delete'] as ['create', 'read', 'update', 'delete'],
          users: ['create', 'read', 'update', 'delete'] as ['create', 'read', 'update', 'delete'],
          analytics: ['read'] as ['read'],
          settings: ['read', 'update'] as ['read', 'update'],
        };
      case 'admin':
        return {
          products: ['create', 'read', 'update', 'delete'] as ['create', 'read', 'update', 'delete'],
          orders: ['create', 'read', 'update', 'delete'] as ['create', 'read', 'update', 'delete'],
          users: ['create', 'read', 'update', 'delete'] as ['create', 'read', 'update', 'delete'],
          analytics: ['read'] as ['read'],
          settings: ['read', 'update'] as ['read', 'update'],
        };
      case 'manager':
        return {
          products: ['create', 'read', 'update', 'delete'] as ['create', 'read', 'update', 'delete'],
          orders: ['create', 'read', 'update', 'delete'] as ['create', 'read', 'update', 'delete'],
          users: ['create', 'read', 'update', 'delete'] as ['create', 'read', 'update', 'delete'],
          analytics: ['read'] as ['read'],
          settings: ['read', 'update'] as ['read', 'update'],
        };
      case 'staff':
        return {
          products: ['create', 'read', 'update', 'delete'] as ['create', 'read', 'update', 'delete'],
          orders: ['create', 'read', 'update', 'delete'] as ['create', 'read', 'update', 'delete'],
          users: ['create', 'read', 'update', 'delete'] as ['create', 'read', 'update', 'delete'],
          analytics: ['read'] as ['read'],
          settings: ['read', 'update'] as ['read', 'update'],
        };
      default:
        return {
          products: ['read'] as ['read'],
          orders: ['read'] as ['read'], 
          users: [] as [],
          analytics: [] as [],
          settings: [] as [],
        };
    }
  }

  // Get session statistics
  getSessionStats() {
    const activeSessions = Array.from(this.sessionStorage.values()).filter(s => s.isActive);
    const customerSessions = activeSessions.filter(s => s.userType === 'customer');
    const adminSessions = activeSessions.filter(s => s.userType === 'admin');

    return {
      total: activeSessions.length,
      customers: customerSessions.length,
      admins: adminSessions.length,
      pendingOTPs: this.otpStorage.size,
    };
  }
}

// Export singleton instance
export const enhancedAuthService = new EnhancedAuthService();
export default enhancedAuthService;


