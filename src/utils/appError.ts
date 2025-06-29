// use for manage controlled errors
class AppError extends Error {
  // public can access from outside the class, readonly can't be changed
  public readonly statusCode: number;
  public readonly status: 'fail' | 'error';
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = true;

    // Set prototype explicitly for instanceof to work correctly
    Object.setPrototypeOf(this, AppError.prototype);

    // Capture stack trace (removes constructor call from stack)
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;