/**
 * Production-safe logging utility
 * Automatically removes console logs in production builds
 */

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug'

interface Logger {
  log: (message: any, ...args: any[]) => void
  warn: (message: any, ...args: any[]) => void
  error: (message: any, ...args: any[]) => void
  info: (message: any, ...args: any[]) => void
  debug: (message: any, ...args: any[]) => void
}

class ProductionLogger implements Logger {
  private shouldLog = process.env.NODE_ENV === 'development'
  
  log(message: any, ...args: any[]): void {
    if (this.shouldLog) {
      console.log(message, ...args)
    }
  }
  
  warn(message: any, ...args: any[]): void {
    if (this.shouldLog) {
      console.warn(message, ...args)
    }
  }
  
  error(message: any, ...args: any[]): void {
    // Always log errors, even in production
    console.error(message, ...args)
    
    // In production, also send to error tracking service
    if (!this.shouldLog && typeof window !== 'undefined') {
      // Send to error tracking service like Sentry
      this.sendToErrorTracking(message, args)
    }
  }
  
  info(message: any, ...args: any[]): void {
    if (this.shouldLog) {
      console.info(message, ...args)
    }
  }
  
  debug(message: any, ...args: any[]): void {
    if (this.shouldLog) {
      console.debug(message, ...args)
    }
  }
  
  private sendToErrorTracking(message: any, args: any[]): void {
    // Implement error tracking integration here
    // Example: Sentry, LogRocket, etc.
    try {
      const gtag = (window as any).gtag
      if (gtag) {
        gtag('event', 'exception', {
          description: typeof message === 'string' ? message : JSON.stringify(message),
          fatal: false
        })
      }
    } catch (e) {
      // Silently fail if error tracking is not available
    }
  }
}

export const logger = new ProductionLogger()

// Type-safe logging helpers
export const logInfo = (message: string, data?: any) => {
  logger.info(`[INFO] ${message}`, data)
}

export const logWarning = (message: string, data?: any) => {
  logger.warn(`[WARNING] ${message}`, data)
}

export const logError = (message: string, error?: any) => {
  logger.error(`[ERROR] ${message}`, error)
}

export const logDebug = (message: string, data?: any) => {
  logger.debug(`[DEBUG] ${message}`, data)
}
