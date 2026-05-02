import { describe, it, expect, beforeEach } from "vitest";
import {
  ErrorHandler,
  ErrorLogger,
  ErrorRecovery,
  OSINTError,
  ErrorCategory,
  ErrorSeverity,
} from "./error-handler";

describe("Error Handler System", () => {
  beforeEach(() => {
    ErrorLogger.clearLogs();
  });

  describe("OSINTError", () => {
    it("should create an OSINT error with all properties", () => {
      const error = new OSINTError(
        "Test error",
        ErrorCategory.NETWORK,
        ErrorSeverity.HIGH,
        "TEST_ERROR",
        500
      );

      expect(error.message).toBe("Test error");
      expect(error.category).toBe(ErrorCategory.NETWORK);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.code).toBe("TEST_ERROR");
      expect(error.statusCode).toBe(500);
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it("should have default severity and code", () => {
      const error = new OSINTError(
        "Test error",
        ErrorCategory.VALIDATION
      );

      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.code).toBe("OSINT_ERROR");
    });
  });

  describe("ErrorLogger", () => {
    it("should log errors", () => {
      const error = new OSINTError(
        "Test error",
        ErrorCategory.NETWORK
      );

      ErrorLogger.log(error, "test operation");
      const logs = ErrorLogger.getLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0].error.message).toBe("Test error");
      expect(logs[0].context).toBe("test operation");
    });

    it("should filter errors by severity", () => {
      const highError = new OSINTError(
        "High severity",
        ErrorCategory.NETWORK,
        ErrorSeverity.HIGH
      );
      const lowError = new OSINTError(
        "Low severity",
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW
      );

      ErrorLogger.log(highError);
      ErrorLogger.log(lowError);

      const highErrors = ErrorLogger.getErrorsBySeverity(ErrorSeverity.HIGH);
      expect(highErrors).toHaveLength(1);
      expect(highErrors[0].error.severity).toBe(ErrorSeverity.HIGH);
    });

    it("should filter errors by category", () => {
      const networkError = new OSINTError(
        "Network error",
        ErrorCategory.NETWORK
      );
      const dbError = new OSINTError(
        "Database error",
        ErrorCategory.DATABASE
      );

      ErrorLogger.log(networkError);
      ErrorLogger.log(dbError);

      const networkErrors = ErrorLogger.getErrorsByCategory(
        ErrorCategory.NETWORK
      );
      expect(networkErrors).toHaveLength(1);
      expect(networkErrors[0].error.category).toBe(ErrorCategory.NETWORK);
    });

    it("should clear logs", () => {
      const error = new OSINTError(
        "Test error",
        ErrorCategory.NETWORK
      );

      ErrorLogger.log(error);
      expect(ErrorLogger.getLogs()).toHaveLength(1);

      ErrorLogger.clearLogs();
      expect(ErrorLogger.getLogs()).toHaveLength(0);
    });

    it("should keep only last 100 logs", () => {
      for (let i = 0; i < 150; i++) {
        const error = new OSINTError(
          `Error ${i}`,
          ErrorCategory.NETWORK
        );
        ErrorLogger.log(error);
      }

      const logs = ErrorLogger.getLogs();
      expect(logs.length).toBeLessThanOrEqual(100);
    });
  });

  describe("ErrorHandler", () => {
    it("should handle network errors", () => {
      const networkError = new Error("Connection timeout");
      (networkError as any).code = "ECONNABORTED";

      const osintError = ErrorHandler.handleNetworkError(
        networkError,
        "API call"
      );

      expect(osintError.category).toBe(ErrorCategory.NETWORK);
      expect(osintError.message).toContain("API call");
      expect(osintError.originalError).toBe(networkError);
    });

    it("should handle validation errors", () => {
      const osintError = ErrorHandler.handleValidationError(
        "Invalid email format",
        "email"
      );

      expect(osintError.category).toBe(ErrorCategory.VALIDATION);
      expect(osintError.severity).toBe(ErrorSeverity.LOW);
      expect(osintError.statusCode).toBe(400);
      expect(osintError.message).toContain("email");
    });

    it("should handle database errors", () => {
      const dbError = new Error("Connection failed");

      const osintError = ErrorHandler.handleDatabaseError(
        dbError,
        "query"
      );

      expect(osintError.category).toBe(ErrorCategory.DATABASE);
      expect(osintError.severity).toBe(ErrorSeverity.HIGH);
      expect(osintError.statusCode).toBe(500);
    });

    it("should handle external API errors", () => {
      const apiError = {
        response: {
          status: 503,
          data: { message: "Service unavailable" },
        },
      };

      const osintError = ErrorHandler.handleExternalAPIError(
        apiError,
        "GitHub"
      );

      expect(osintError.category).toBe(ErrorCategory.EXTERNAL_API);
      expect(osintError.message).toContain("GitHub");
      expect(osintError.statusCode).toBe(503);
    });

    it("should handle rate limit errors", () => {
      const osintError = ErrorHandler.handleRateLimitError("Shodan", 60);

      expect(osintError.category).toBe(ErrorCategory.RATE_LIMIT);
      expect(osintError.severity).toBe(ErrorSeverity.LOW);
      expect(osintError.statusCode).toBe(429);
      expect(osintError.message).toContain("60");
    });

    it("should handle timeout errors", () => {
      const osintError = ErrorHandler.handleTimeoutError("Port scan", 5000);

      expect(osintError.category).toBe(ErrorCategory.TIMEOUT);
      expect(osintError.severity).toBe(ErrorSeverity.MEDIUM);
      expect(osintError.statusCode).toBe(504);
      expect(osintError.message).toContain("5000");
    });

    it("should handle authentication errors", () => {
      const osintError = ErrorHandler.handleAuthenticationError(
        "Invalid token"
      );

      expect(osintError.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(osintError.severity).toBe(ErrorSeverity.HIGH);
      expect(osintError.statusCode).toBe(401);
    });

    it("should handle authorization errors", () => {
      const osintError = ErrorHandler.handleAuthorizationError(
        "admin panel"
      );

      expect(osintError.category).toBe(ErrorCategory.AUTHORIZATION);
      expect(osintError.severity).toBe(ErrorSeverity.MEDIUM);
      expect(osintError.statusCode).toBe(403);
    });

    it("should convert OSINTError to tRPC error", () => {
      const osintError = new OSINTError(
        "Not found",
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW,
        "NOT_FOUND",
        404
      );

      const trpcError = ErrorHandler.toTRPCError(osintError);

      expect(trpcError.code).toBe("NOT_FOUND");
      expect(trpcError.message).toBe("Not found");
    });

    it("should safely execute operations", async () => {
      const result = await ErrorHandler.safeExecute(
        async () => "success",
        "test operation"
      );

      expect(result).toBe("success");
    });

    it("should catch and log operation errors", async () => {
      const operation = async () => {
        throw new Error("Operation failed");
      };

      try {
        await ErrorHandler.safeExecute(
          operation,
          "failing operation"
        );
      } catch (error: any) {
        expect(error.message).toContain("failing operation");
      }
    });
  });

  describe("ErrorRecovery", () => {
    it("should retry with exponential backoff", async () => {
      let attempts = 0;

      const operation = async () => {
        attempts++;
        if (attempts < 3) {
          const error = new Error("Temporary failure");
          (error as any).statusCode = 503;
          throw error;
        }
        return "success";
      };

      const result = await ErrorRecovery.retryWithBackoff(
        operation,
        3,
        100
      );

      expect(result).toBe("success");
      expect(attempts).toBe(3);
    });

    it("should not retry on client errors", async () => {
      let attempts = 0;

      const operation = async () => {
        attempts++;
        const error = new Error("Bad request");
        (error as any).statusCode = 400;
        throw error;
      };

      try {
        await ErrorRecovery.retryWithBackoff(operation, 3, 100);
      } catch (error: any) {
        expect(attempts).toBe(1); // Should not retry
      }
    });

    it("should use fallback data on operation failure", async () => {
      const operation = async () => {
        throw new Error("Operation failed");
      };

      const fallbackData = { cached: true };
      const result = await ErrorRecovery.withFallback(
        operation,
        fallbackData,
        "test operation"
      );

      expect(result).toEqual(fallbackData);
    });

    it("should create circuit breaker", async () => {
      let callCount = 0;

      const operation = async () => {
        callCount++;
        if (callCount <= 5) {
          throw new Error("Service error");
        }
        return "success";
      };

      const breaker = ErrorRecovery.createCircuitBreaker(
        operation,
        5,
        100
      );

      // First 5 calls should fail
      for (let i = 0; i < 5; i++) {
        try {
          await breaker();
        } catch (error: any) {
          // Expected to fail
        }
      }

      // 6th call should fail with circuit breaker open
      try {
        await breaker();
        expect.fail("Should have thrown circuit breaker error");
      } catch (error: any) {
        expect(error.message).toContain("Circuit breaker");
      }
    });
  });
});
