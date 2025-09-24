/**
 * Backend Logger Service
 * Simple production-safe logging for backend services
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class BackendLogger {
    private isDevelopment = process.env.NODE_ENV !== 'production';

    private formatMessage(level: LogLevel, message: string, context?: string): string {
        const timestamp = new Date().toISOString();
        const contextStr = context ? `[${context}] ` : '';
        return `${timestamp} [${level.toUpperCase()}] ${contextStr}${message}`;
    }

    debug(message: string, context?: string, data?: any) {
        if (this.isDevelopment) {
            console.log(this.formatMessage('debug', message, context), data || '');
        }
    }

    info(message: string, context?: string, data?: any) {
        console.log(this.formatMessage('info', message, context), data || '');
    }

    warn(message: string, context?: string, data?: any) {
        console.warn(this.formatMessage('warn', message, context), data || '');
    }

    error(message: string, context?: string, data?: any) {
        console.error(this.formatMessage('error', message, context), data || '');
    }
}

export const logger = new BackendLogger();