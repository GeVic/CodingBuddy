import {
  ApiError,
  NetworkError,
  TimeoutError,
  ParseError,
  BaseError,
  isErrorResponse,
  isNetworkError,
  ErrorResponse,
} from "@/app/types/errors";

// Error handler for API calls
export class ErrorHandler {
  /**
   * Handles errors from fetch operations
   */
  static async handleFetchError(error: any): Promise<never> {
    // Network errors
    if (isNetworkError(error)) {
      throw new NetworkError(error);
    }

    // Timeout errors
    if (error.name === "AbortError") {
      throw new TimeoutError();
    }

    // Other errors
    throw new BaseError(
      error.message || "An unexpected error occurred",
      500,
      "UNKNOWN_ERROR"
    );
  }

  /**
   * Handles API response errors
   */
  static async handleApiResponse(response: Response): Promise<any> {
    // Try to parse the response
    let data: any;
    const contentType = response.headers.get("content-type");

    try {
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        // If not JSON, try to get text
        const text = await response.text();
        data = { message: text };
      }
    } catch (error) {
      // If parsing fails, throw parse error
      throw new ParseError();
    }

    // Check if response is ok
    if (!response.ok) {
      // Check if it's our error format
      if (isErrorResponse(data)) {
        throw new ApiError(data);
      }

      // Otherwise create a generic API error
      throw new BaseError(
        data.message || `Request failed with status ${response.status}`,
        response.status,
        "API_ERROR"
      );
    }

    return data;
  }

  /**
   * Wraps an async function with error handling
   */
  static wrapAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options?: {
      onError?: (error: BaseError) => void;
      fallbackValue?: any;
      rethrow?: boolean;
    }
  ): T {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args);
      } catch (error) {
        const handledError = this.normalizeError(error);

        // Call error callback if provided
        if (options?.onError) {
          options.onError(handledError);
        }

        // Rethrow if specified
        if (options?.rethrow !== false) {
          throw handledError;
        }

        // Return fallback value if provided
        return options?.fallbackValue;
      }
    }) as T;
  }

  /**
   * Normalizes any error to BaseError
   */
  static normalizeError(error: any): BaseError {
    // Already a BaseError
    if (error instanceof BaseError) {
      return error;
    }

    // Network error
    if (isNetworkError(error)) {
      return new NetworkError(error);
    }

    // Timeout error
    if (error.name === "AbortError") {
      return new TimeoutError();
    }

    // Generic error
    return new BaseError(
      error.message || "An unexpected error occurred",
      500,
      "UNKNOWN_ERROR"
    );
  }

  /**
   * Creates a timeout signal for fetch requests
   */
  static createTimeoutSignal(timeoutMs: number = 30000): AbortSignal {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeoutMs);
    return controller.signal;
  }

  /**
   * Retries a function with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    options?: {
      maxRetries?: number;
      initialDelay?: number;
      maxDelay?: number;
      backoffFactor?: number;
      shouldRetry?: (error: BaseError, attempt: number) => boolean;
    }
  ): Promise<T> {
    const {
      maxRetries = 3,
      initialDelay = 1000,
      maxDelay = 10000,
      backoffFactor = 2,
      shouldRetry = (error: BaseError, _attempt: number) => error.statusCode >= 500 || error.code === "NETWORK_ERROR",
    } = options || {};

    let lastError: BaseError;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = this.normalizeError(error);

        // Check if we should retry
        if (attempt === maxRetries || !shouldRetry(lastError, attempt)) {
          throw lastError;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Calculate next delay with backoff
        delay = Math.min(delay * backoffFactor, maxDelay);
      }
    }

    throw lastError!;
  }

  /**
   * Logs error for debugging (can be enhanced with external logging service)
   */
  static logError(error: BaseError, context?: Record<string, any>): void {
    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      console.error("Error occurred:", {
        ...error.toJSON(),
        context,
        stack: error.stack,
      });
    } else {
      // In production, you might want to send to an error tracking service
      console.error(`[${error.code}] ${error.message}`);
    }
  }
}

// Convenience function for making API calls with error handling
export async function apiCall<T>(
  url: string,
  options?: RequestInit & { timeout?: number }
): Promise<T> {
  try {
    const { timeout = 30000, ...fetchOptions } = options || {};

    const response = await fetch(url, {
      ...fetchOptions,
      signal: ErrorHandler.createTimeoutSignal(timeout),
    });

    return await ErrorHandler.handleApiResponse(response);
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }
    return ErrorHandler.handleFetchError(error);
  }
}
