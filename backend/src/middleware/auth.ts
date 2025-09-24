import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return next(createError('Access token required', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      role?: string;
    };
    req.user = decoded;
    next();
  } catch {
    return next(createError('Invalid or expired token', 401));
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(createError('Authentication required', 401));
  }

  if (!req.user.role || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(req.user.role)) {
    return next(createError('Admin access required', 403));
  }

  next();
};

export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(createError('Authentication required', 401));
  }

  if (req.user.role !== 'SUPER_ADMIN') {
    return next(createError('Super admin access required', 403));
  }

  next();
};