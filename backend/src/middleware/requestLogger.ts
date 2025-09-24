import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log request
  logger.debug(`${req.method} ${req.path}`, 'REQUEST', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? '🚨' : '✅';
    
    logger.info(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`, 'RESPONSE');
  });

  next();
};