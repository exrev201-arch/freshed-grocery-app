/**
 * Error Handling Utilities for Fresh App
 * Provides consistent error handling, logging, and user feedback
 */

import { useToast } from '../hooks/use-toast';
import { useAuthStore } from '../store/auth-store';

// Error types
export type ErrorType = 
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'PERMISSION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

export interface AppError {
    type: ErrorType;
    message: string;
    code?: string;
    details?: unknown;
    timestamp: number;
    userId?: string;
}

// Error messages for different types
const ERROR_MESSAGES: Record<ErrorType, string> = {
  NETWORK_ERROR: 'Connection problem. Please check your internet and try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  AUTH_ERROR: 'Please log in to continue.',
  PERMISSION_ERROR: 'You don\'t have permission to perform this action.',
  NOT_FOUND_ERROR: 'The requested item was not found.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

// Swahili error messages for local users
const ERROR_MESSAGES_SW: Record<ErrorType, string> = {
  NETWORK_ERROR: 'Tatizo la muunganisho. Hakiki mtandao wako na ujaribu tena.',
  VALIDATION_ERROR: 'Hakiki taarifa ulizojaza na ujaribu tena.',
  AUTH_ERROR: 'Ingia kwanza ili kuendelea.',
  PERMISSION_ERROR: 'Huna ruhusa ya kufanya kitendo hiki.',
  NOT_FOUND_ERROR: 'Kile ulichotaka hakikupatikana.',
  SERVER_ERROR: 'Kuna tatizo upande wetu. Jaribu tena baadaye.',
  UNKNOWN_ERROR: 'Kuna hitilafu isiyotarajiwa. Jaribu tena.'
};

class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: AppError[] = [];
  private readonly maxErrors = 100;

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Create a standardized error object
   */
  createError(
    type: ErrorType,
    message?: string,
    code?: string,
    details?: unknown,
    userId?: string
  ): AppError {
    const error: AppError = {
      type,
      message: message || ERROR_MESSAGES[type],
      code,
      details,
      timestamp: Date.now(),
      userId
    };

    this.logError(error);
    return error;
  }

  /**
   * Handle and categorize different types of errors
   */
  handleError(error: unknown, userId?: string): AppError {
    let appError: AppError;

    if (error instanceof Error) {
      // Network errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        appError = this.createError('NETWORK_ERROR', undefined, undefined, error.message, userId);
      }
      // Authentication errors
      else if (error.message.includes('auth') || error.message.includes('401')) {
        appError = this.createError('AUTH_ERROR', undefined, undefined, error.message, userId);
      }
      // Permission errors
      else if (error.message.includes('403') || error.message.includes('permission')) {
        appError = this.createError('PERMISSION_ERROR', undefined, undefined, error.message, userId);
      }
      // Not found errors
      else if (error.message.includes('404') || error.message.includes('not found')) {
        appError = this.createError('NOT_FOUND_ERROR', undefined, undefined, error.message, userId);
      }
      // Server errors
      else if (error.message.includes('500') || error.message.includes('server')) {
        appError = this.createError('SERVER_ERROR', undefined, undefined, error.message, userId);
      }
      // Generic errors
      else {
        appError = this.createError('UNKNOWN_ERROR', error.message, undefined, error.stack, userId);
      }
    } else {
      // Handle non-Error objects
      appError = this.createError('UNKNOWN_ERROR', 'An unknown error occurred', undefined, error, userId);
    }

    return appError;
  }

  /**
   * Log error for debugging and monitoring
   */
  private logError(error: AppError): void {
    // Add to in-memory store
    this.errors.unshift(error);
    if (this.errors.length > this.maxErrors) {
      this.errors.pop();
    }

    // Console logging
    console.error('Fresh App Error:', {
      type: error.type,
      message: error.message,
      code: error.code,
      timestamp: new Date(error.timestamp).toISOString(),
      userId: error.userId,
      details: error.details
    });

    // In production, you would send this to a logging service
    // this.sendToLoggingService(error);
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error: AppError, language: 'en' | 'sw' = 'en'): string {
    const messages = language === 'sw' ? ERROR_MESSAGES_SW : ERROR_MESSAGES;
    return error.message || messages[error.type];
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(count: number = 10): AppError[] {
    return this.errors.slice(0, count);
  }

  /**
   * Clear error history
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Get error statistics
   */
  getErrorStats(): Record<ErrorType, number> {
    const stats: Record<ErrorType, number> = {
      NETWORK_ERROR: 0,
      VALIDATION_ERROR: 0,
      AUTH_ERROR: 0,
      PERMISSION_ERROR: 0,
      NOT_FOUND_ERROR: 0,
      SERVER_ERROR: 0,
      UNKNOWN_ERROR: 0
    };

    this.errors.forEach(error => {
      stats[error.type]++;
    });

    return stats;
  }
}

// Singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Utility functions for common error scenarios
export const handleNetworkError = (error: unknown, userId?: string) => {
  return errorHandler.handleError(error, userId);
};

export const handleValidationError = (message: string, details?: unknown, userId?: string) => {
  return errorHandler.createError('VALIDATION_ERROR', message, undefined, details, userId);
};

export const handleAuthError = (message?: string, userId?: string) => {
  return errorHandler.createError('AUTH_ERROR', message, undefined, undefined, userId);
};

export const handlePermissionError = (message?: string, userId?: string) => {
  return errorHandler.createError('PERMISSION_ERROR', message, undefined, undefined, userId);
};

// React hook for error handling
export const useErrorHandler = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();

  const showError = (error: AppError | unknown, language: 'en' | 'sw' = 'en') => {
    let appError: AppError;
    
    if (error && typeof error === 'object' && 'type' in error) {
      appError = error as AppError;
    } else {
      appError = errorHandler.handleError(error, user?.uid);
    }

    const message = errorHandler.getUserMessage(appError, language);
    
    toast({
      title: language === 'sw' ? 'Hitilafu' : 'Error',
      description: message,
      variant: 'destructive',
    });

    return appError;
  };

  return { showError };
};