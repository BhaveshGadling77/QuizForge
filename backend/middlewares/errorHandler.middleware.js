/**
 * Global Error Handling Middleware
 * Centralized error handling and logging
 */

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Global error handler middleware
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log error details
  console.error({
    timestamp: new Date().toISOString(),
    status: statusCode,
    message,
    url: req.originalUrl,
    method: req.method,
    user: req.user?.id || "anonymous",
    stack: err.stack,
  });

  // Don't expose stack trace in production
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
}

// 404 handler middleware
export function notFoundHandler(req, res, next) {
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
}

// Async handler to wrap async route handlers
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Specific error handlers
export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access forbidden") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409);
  }
}
