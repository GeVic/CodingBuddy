// Error response structure matching backend
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    stack?: string;
    details?: any;
  };
  requestId?: string;
}

// Base error class for frontend errors
export class BaseError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly name: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    isOperational: boolean = true,
  ) {
    super(message);

    // Maintains proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date();

    // Captures stack trace, excluding constructor call from it
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serializes error for JSON responses
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      isOperational: this.isOperational,
      ...(this.details && { details: this.details }),
    };
  }

  /**
   * Format error for logging
   */
  toString(): string {
    return `${this.name} [${this.code}]: ${this.message}`;
  }
}

// API Error - for errors from backend API calls
export class ApiError extends BaseError {
  constructor(response: ErrorResponse) {
    super(
      response.error.message,
      response.error.statusCode,
      response.error.code,
      true,
    );

    this.details = response.error.details;
  }
}

// Network Error - for connection issues
export class NetworkError extends BaseError {
  constructor(originalError: any) {
    const message = "Unable to connect to the service. Please check your connection.";
    super(message, 503, "NETWORK_ERROR", true);

    this.details = {
      originalMessage: originalError?.message,
      originalName: originalError?.name,
    };
  }
}

// Validation Error - for client-side validation
export class ValidationError extends BaseError {
  constructor(message: string, field?: string) {
    super(message, 400, "VALIDATION_ERROR", true);

    if (field) {
      this.details = { field };
    }
  }
}

// Timeout Error - for request timeouts
export class TimeoutError extends BaseError {
  constructor(operation: string = "Request") {
    super(`${operation} timed out. Please try again.`, 408, "TIMEOUT_ERROR", true);
  }
}

// Parse Error - for JSON parsing issues
export class ParseError extends BaseError {
  constructor(message: string = "Failed to parse response") {
    super(message, 500, "PARSE_ERROR", true);
  }
}

// Error type guards
export const isErrorResponse = (error: any): error is ErrorResponse => {
  return (
    error &&
    typeof error === "object" &&
    error.success === false &&
    error.error &&
    typeof error.error.message === "string" &&
    typeof error.error.statusCode === "number"
  );
};

export const isNetworkError = (error: any): boolean => {
  return (
    error instanceof TypeError &&
    (error.message.includes("fetch") || error.message.includes("network"))
  );
};

// User-friendly error messages mapping
export const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: "Connection issue. Please check your internet.",
  TIMEOUT_ERROR: "Request took too long. Please try again.",
  VALIDATION_ERROR: "Please check your input.",
  INTERNAL_ERROR: "Something went wrong. Please try again.",
  REDIS_CONNECTION_ERROR: "Service temporarily unavailable.",
  REDIS_TIMEOUT: "Service is slow. Please try again.",
  REDIS_ERROR: "Service error. Please try again.",
  SERVICE_ERROR: "Service error. Please try again.",
  NOT_FOUND: "Resource not found.",
  UNAUTHORIZED: "You need to be logged in.",
  FORBIDDEN: "You don't have permission to do this.",
  RATE_LIMIT: "Too many requests. Please slow down.",
};

// Get user-friendly error message
export const getUserFriendlyMessage = (error: any): string => {
  if (error instanceof BaseError) {
    return ERROR_MESSAGES[error.code] || error.message;
  }

  if (isErrorResponse(error)) {
    return ERROR_MESSAGES[error.error.code] || error.error.message;
  }

  if (isNetworkError(error)) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  return ERROR_MESSAGES.INTERNAL_ERROR;
};
