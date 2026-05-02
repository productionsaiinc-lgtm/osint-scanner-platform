import { TRPCError } from "@trpc/server";

/**
 * Error Severity Levels
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Error Category for better tracking and debugging
 */
export enum ErrorCategory {
  NETWORK = "network",
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  DATABASE = "database",
  EXTERNAL_API = "external_api",
  RATE_LIMIT = "rate_limit",
  TIMEOUT = "timeout",
  INTERNAL = "internal",
}

/**
 * Custom OSINT Error class
 */
export class OSINTError extends Error {
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly code: string;
  public readonly statusCode: number;
  public readonly originalError?: Error;
  public readonly timestamp: Date;

  constructor(
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    code: string = "OSINT_ERROR",
    statusCode: number = 500,
    originalError?: Error
  ) {
    super(message);
    this.name = "OSINTError";
    this.category = category;
    this.severity = severity;
    this.code = code;
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.timestamp = new Date();
  }
}

/**
 * Error Logger - logs errors with structured format
 */
export class ErrorLogger {
  private static readonly MAX_LOG_SIZE = 1000; // characters
  private static logs: Array<{
    timestamp: Date;
    error: OSINTError;
    context?: string;
  }> = [];

  /**
   * Log an error with context
   */
  static log(error: OSINTError, context?: string): void {
    const logEntry = {
      timestamp: error.timestamp,
      error,
      context,
    };

    this.logs.push(logEntry);

    // Keep only last 100 logs in memory
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }

    // Log to console in development only
    if (process.env.NODE_ENV === "development") {
      console.error(`[${error.code}] ${error.message}`, {
        category: error.category,
        severity: error.severity,
        context,
        originalError: error.originalError?.message,
      });
    }
  }

  /**
   * Get all logged errors
   */
  static getLogs() {
    return this.logs;
  }

  /**
   * Get errors by severity
   */
  static getErrorsBySeverity(severity: ErrorSeverity) {
    return this.logs.filter((log) => log.error.severity === severity);
  }

  /**
   * Get errors by category
   */
  static getErrorsByCategory(category: ErrorCategory) {
    return this.logs.filter((log) => log.error.category === category);
  }

  /**
   * Clear all logs
   */
  static clearLogs(): void {
    this.logs = [];
  }
}

/**
 * Error Handler - converts errors to appropriate responses
 */
export class ErrorHandler {
  /**
   * Handle network errors (API calls, timeouts, etc.)
   */
  static handleNetworkError(
    error: any,
    operation: string
  ): OSINTError {
    const message = error?.message || "Network operation failed";
    const osintError = new OSINTError(
      `${operation}: ${message}`,
      ErrorCategory.NETWORK,
      error?.code === "ECONNABORTED"
        ? ErrorSeverity.MEDIUM
        : ErrorSeverity.HIGH,
      error?.code || "NETWORK_ERROR",
      error?.statusCode || 503,
      error
    );

    ErrorLogger.log(osintError, operation);
    return osintError;
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(
    message: string,
    field?: string
  ): OSINTError {
    const fullMessage = field
      ? `Validation error in ${field}: ${message}`
      : `Validation error: ${message}`;

    const osintError = new OSINTError(
      fullMessage,
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      "VALIDATION_ERROR",
      400
    );

    ErrorLogger.log(osintError);
    return osintError;
  }

  /**
   * Handle database errors
   */
  static handleDatabaseError(error: any, operation: string): OSINTError {
    const message = error?.message || "Database operation failed";
    const osintError = new OSINTError(
      `Database ${operation} failed: ${message}`,
      ErrorCategory.DATABASE,
      ErrorSeverity.HIGH,
      "DATABASE_ERROR",
      500,
      error
    );

    ErrorLogger.log(osintError, operation);
    return osintError;
  }

  /**
   * Handle external API errors
   */
  static handleExternalAPIError(
    error: any,
    apiName: string
  ): OSINTError {
    const statusCode = error?.response?.status || 503;
    const message = error?.response?.data?.message || error?.message || "External API call failed";

    let severity = ErrorSeverity.MEDIUM;
    if (statusCode === 429) severity = ErrorSeverity.LOW; // Rate limit
    if (statusCode >= 500) severity = ErrorSeverity.HIGH; // Server error

    const osintError = new OSINTError(
      `${apiName} API error: ${message}`,
      ErrorCategory.EXTERNAL_API,
      severity,
      `${apiName.toUpperCase()}_API_ERROR`,
      statusCode,
      error
    );

    ErrorLogger.log(osintError, apiName);
    return osintError;
  }

  /**
   * Handle rate limit errors
   */
  static handleRateLimitError(apiName: string, retryAfter?: number): OSINTError {
    const message = retryAfter
      ? `Rate limited by ${apiName}. Retry after ${retryAfter}s`
      : `Rate limited by ${apiName}`;

    const osintError = new OSINTError(
      message,
      ErrorCategory.RATE_LIMIT,
      ErrorSeverity.LOW,
      "RATE_LIMIT_ERROR",
      429
    );

    ErrorLogger.log(osintError, apiName);
    return osintError;
  }

  /**
   * Handle timeout errors
   */
  static handleTimeoutError(operation: string, timeout: number): OSINTError {
    const osintError = new OSINTError(
      `Operation "${operation}" timed out after ${timeout}ms`,
      ErrorCategory.TIMEOUT,
      ErrorSeverity.MEDIUM,
      "TIMEOUT_ERROR",
      504
    );

    ErrorLogger.log(osintError, operation);
    return osintError;
  }

  /**
   * Handle authentication errors
   */
  static handleAuthenticationError(reason?: string): OSINTError {
    const message = reason || "Authentication failed";
    const osintError = new OSINTError(
      message,
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.HIGH,
      "AUTHENTICATION_ERROR",
      401
    );

    ErrorLogger.log(osintError);
    return osintError;
  }

  /**
   * Handle authorization errors
   */
  static handleAuthorizationError(resource?: string): OSINTError {
    const message = resource
      ? `Not authorized to access ${resource}`
      : "Not authorized";

    const osintError = new OSINTError(
      message,
      ErrorCategory.AUTHORIZATION,
      ErrorSeverity.MEDIUM,
      "AUTHORIZATION_ERROR",
      403
    );

    ErrorLogger.log(osintError);
    return osintError;
  }

  /**
   * Convert OSINTError to tRPC error
   */
  static toTRPCError(error: OSINTError): TRPCError {
    const codeMap: Record<number, any> = {
      400: "BAD_REQUEST",
      401: "UNAUTHORIZED",
      403: "FORBIDDEN",
      404: "NOT_FOUND",
      429: "TOO_MANY_REQUESTS",
      503: "SERVICE_UNAVAILABLE",
      504: "TIMEOUT",
    };

    const code = codeMap[error.statusCode] || "INTERNAL_SERVER_ERROR";

    return new TRPCError({
      code: code as any,
      message: error.message,
      cause: error.originalError,
    });
  }

  /**
   * Safe wrapper for async operations
   */
  static async safeExecute<T>(
    operation: () => Promise<T>,
    operationName: string,
    errorCategory: ErrorCategory = ErrorCategory.INTERNAL
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      const osintError = new OSINTError(
        `${operationName} failed: ${error?.message || "Unknown error"}`,
        errorCategory,
        ErrorSeverity.HIGH,
        "OPERATION_FAILED",
        500,
        error
      );

      ErrorLogger.log(osintError, operationName);
      throw this.toTRPCError(osintError);
    }
  }
}

/**
 * Error Recovery Strategies
 */
export class ErrorRecovery {
  /**
   * Retry with exponential backoff
   */
  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        // Don't retry on client errors (4xx)
        if (error?.statusCode >= 400 && error?.statusCode < 500) {
          throw error;
        }

        // Calculate exponential backoff
        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Fallback to cached data if operation fails
   */
  static async withFallback<T>(
    operation: () => Promise<T>,
    fallbackData: T,
    operationName: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      ErrorLogger.log(
        new OSINTError(
          `${operationName} failed, using fallback data`,
          ErrorCategory.INTERNAL,
          ErrorSeverity.MEDIUM,
          "FALLBACK_USED",
          200,
          error
        )
      );
      return fallbackData;
    }
  }

  /**
   * Circuit breaker pattern
   */
  static createCircuitBreaker<T>(
    operation: () => Promise<T>,
    failureThreshold: number = 5,
    resetTimeout: number = 60000
  ) {
    let failureCount = 0;
    let lastFailureTime = 0;
    let isOpen = false;

    return async (): Promise<T> => {
      // Check if circuit should be reset
      if (isOpen && Date.now() - lastFailureTime > resetTimeout) {
        isOpen = false;
        failureCount = 0;
      }

      // Reject if circuit is open
      if (isOpen) {
        throw new OSINTError(
          "Circuit breaker is open. Service temporarily unavailable.",
          ErrorCategory.INTERNAL,
          ErrorSeverity.HIGH,
          "CIRCUIT_BREAKER_OPEN",
          503
        );
      }

      try {
        const result = await operation();
        failureCount = 0; // Reset on success
        return result;
      } catch (error: any) {
        failureCount++;
        lastFailureTime = Date.now();

        if (failureCount >= failureThreshold) {
          isOpen = true;
        }

        throw error;
      }
    };
  }
}
