/**
 * Error Logging Service
 * Centralized error logging and monitoring
 */

interface ErrorLog {
  message: string;
  stack?: string;
  componentStack?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  timestamp: number;
  severity: 'error' | 'warning' | 'info';
  metadata?: Record<string, unknown>;
}

class ErrorLoggingService {
  private isDevelopment = import.meta.env.DEV;

  /**
   * Log error to console and error tracking service
   */
  logError = (error: Error, errorInfo?: React.ErrorInfo, metadata?: Record<string, unknown>): void => {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack ?? undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: Date.now(),
      severity: 'error',
      metadata,
    };

    // Log to console in development
    if (this.isDevelopment) {
      console.error('[ErrorLogger]', errorLog);
    }

    // Send to error tracking service (Sentry, LogRocket, etc.)
    // TODO: Integrate with error tracking service
    // Example: Sentry.captureException(error, { extra: metadata });
  };

  /**
   * Log warning
   */
  logWarning = (message: string, metadata?: Record<string, unknown>): void => {
    if (this.isDevelopment) {
      console.warn('[ErrorLogger]', message, metadata);
    }
    // Send to error tracking service
  };

  /**
   * Log info
   */
  logInfo = (message: string, metadata?: Record<string, unknown>): void => {
    if (this.isDevelopment) {
      console.info('[ErrorLogger]', message, metadata);
    }
    // Send to error tracking service
  };
}

export const errorLoggingService = new ErrorLoggingService();

