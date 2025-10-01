/**
 * Production Logger Service
 * 
 * Replaces console.log/error statements with proper logging for production
 * Provides structured logging with different levels and prevents sensitive data exposure
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: string;
    data?: any;
    userId?: string;
}

class ProductionLogger {
    private isDevelopment = process.env.NODE_ENV === 'development';
    private logs: LogEntry[] = [];
    private maxLogs = 1000; // Keep last 1000 logs in memory

    private createLogEntry(level: LogLevel, message: string, context?: string, data?: any, userId?: string): LogEntry {
        return {
            level,
            message,
            timestamp: new Date().toISOString(),
            context,
            data: this.sanitizeData(data),
            userId
        };
    }

    private sanitizeData(data: any): any {
        if (!data) return data;
        
        // Remove sensitive information
        const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];
        
        if (typeof data === 'object') {
            const sanitized = { ...data };
            for (const key of sensitiveKeys) {
                if (key in sanitized) {
                    sanitized[key] = '[REDACTED]';
                }
            }
            return sanitized;
        }
        
        return data;
    }

    private addLog(entry: LogEntry) {
        this.logs.push(entry);
        
        // Keep only recent logs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
        
        // In development, also log to console
        if (this.isDevelopment) {
            const consoleMethod = entry.level === 'error' ? console.error : 
                                entry.level === 'warn' ? console.warn : console.log;
            consoleMethod(`[${entry.level.toUpperCase()}] ${entry.context || ''}: ${entry.message}`, entry.data || '');
        }
    }

    debug(message: string, context?: string, data?: any, userId?: string) {
        if (this.isDevelopment) {
            this.addLog(this.createLogEntry('debug', message, context, data, userId));
        }
    }

    info(message: string, context?: string, data?: any, userId?: string) {
        this.addLog(this.createLogEntry('info', message, context, data, userId));
    }

    warn(message: string, context?: string, data?: any, userId?: string) {
        this.addLog(this.createLogEntry('warn', message, context, data, userId));
    }

    error(message: string, context?: string, data?: any, userId?: string) {
        this.addLog(this.createLogEntry('error', message, context, data, userId));
        
        // In production, you might want to send errors to an external service
        if (!this.isDevelopment) {
            // Example: Send to error tracking service
            // this.sendToErrorService(entry);
        }
    }

    // Get recent logs (for debugging)
    getRecentLogs(level?: LogLevel, limit: number = 100): LogEntry[] {
        const filteredLogs = level ? this.logs.filter(log => log.level === level) : this.logs;
        return filteredLogs.slice(-limit);
    }

    // Clear logs
    clearLogs() {
        this.logs = [];
    }

    // Export logs for analysis
    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }
}

// Singleton instance
export const logger = new ProductionLogger();

// Convenience methods that match console API
export const log = {
    debug: (message: string, ...args: any[]) => logger.debug(message, 'APP', args),
    info: (message: string, ...args: any[]) => logger.info(message, 'APP', args),
    warn: (message: string, ...args: any[]) => logger.warn(message, 'APP', args),
    error: (message: string, ...args: any[]) => logger.error(message, 'APP', args),
};