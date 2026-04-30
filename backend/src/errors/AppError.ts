export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code = "APP_ERROR",
  ) {
    super(message);
  }
}

export function notFound(message = "Resource not found"): AppError {
  return new AppError(404, message, "NOT_FOUND");
}

export function forbidden(message = "Forbidden"): AppError {
  return new AppError(403, message, "FORBIDDEN");
}

export function unauthorized(message = "Unauthorized"): AppError {
  return new AppError(401, message, "UNAUTHORIZED");
}
