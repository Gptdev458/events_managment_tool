/**
 * Structured logging utility for production applications
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  error?: Error
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error
    }

    // In development, use console for immediate feedback
    if (this.isDevelopment) {
      const logFn = console[level] || console.log
      
      if (error) {
        logFn(`[${level.toUpperCase()}] ${message}`, context || {}, error)
      } else {
        logFn(`[${level.toUpperCase()}] ${message}`, context || {})
      }
    } else {
      // In production, structure logs for proper monitoring
      // This would typically send to a logging service like Winston, Datadog, etc.
      const logOutput = JSON.stringify(entry)
      console.log(logOutput)
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (this.isDevelopment) {
      this.log('debug', message, context)
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.log('error', message, context, error)
  }

  // Specific methods for common use cases
  
  serverActionError(action: string, error: Error, context?: Record<string, unknown>) {
    this.error(`Server action failed: ${action}`, error, context)
  }

  databaseError(operation: string, error: Error, context?: Record<string, unknown>) {
    this.error(`Database operation failed: ${operation}`, error, context)
  }

  validationError(field: string, value: unknown, reason: string) {
    this.warn(`Validation failed for ${field}`, { field, value, reason })
  }

  userAction(action: string, context?: Record<string, unknown>) {
    this.info(`User action: ${action}`, context)
  }
}

export const logger = new Logger()

// Convenience functions for backward compatibility
export const logError = (message: string, error?: Error, context?: Record<string, unknown>) => 
  logger.error(message, error, context)

export const logInfo = (message: string, context?: Record<string, unknown>) => 
  logger.info(message, context)

export const logWarning = (message: string, context?: Record<string, unknown>) => 
  logger.warn(message, context)

export const logDebug = (message: string, context?: Record<string, unknown>) => 
  logger.debug(message, context) 