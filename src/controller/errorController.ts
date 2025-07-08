import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';

interface MongoError extends Error {
  code?: number;
  path?: string;
  value?: string;
  errors?: { [key: string]: { message: string } };
  errmsg?: string;
}

function isMongoError(error: any): error is MongoError {
  return typeof error === 'object' && ('code' in error || 'errmsg' in error);
}

class ErrorController {
  private handleCastErrorDB(err: MongoError): AppError {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
  }

  private handleDuplicateFieldsDB(err: MongoError): AppError {
    const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0] || 'unknown';
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
  }

  private handleValidationErrorDB(err: MongoError): AppError {
    const errors = Object.values(err.errors || {}).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
  }

  private handleJWTError(): AppError {
    return new AppError('Invalid token. Please log in again!', 401);
  }

  private handleJWTExpiredError(): AppError {
    return new AppError('Your token has expired! Please log in again.', 401);
  }

  private sendErrorDev(err: AppError, req: Request, res: Response): void {
    // API
    if (req.originalUrl.startsWith('/api')) {
      res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
      });
      return;
    }

    // RENDERED WEBSITE
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }

  private sendErrorProd(err: AppError, res: Response): void {
    if (res.headersSent) return;

    // Operational, trusted error: send message to client
    if (err.isOperational) {
      // Send generic message
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });

      // Programming or other unknown error: don't leak error details
    } else {
      // Log error
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!'
      });
    }
  }

  public handleError = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    let error = err;

    // fallback if error no equal AppError
    if (!(error instanceof AppError)) {
      error = new AppError(error.message, 500);
    }

    if (process.env.NODE_ENV === 'development') {
      this.sendErrorDev(new AppError(err.message, 500), req, res);
    }
    // production
    else {
      if (isMongoError(error)) {
        if (error.name === 'CastError') {
          error = this.handleCastErrorDB(error);
        } else if (error.code === 11000) {
          error = this.handleDuplicateFieldsDB(error);
        } else if (error.name === 'ValidationError') {
          error = this.handleValidationErrorDB(error);
        } else if (error.name === 'JsonWebTokenError') {
          error = this.handleJWTError();
        } else if (error.name === 'TokenExpiredError') {
          error = this.handleJWTExpiredError();
        } else {
          error = new AppError(error.message, 500);
        }
      }

      this.sendErrorProd(error as AppError, res);
    }
  };
}

export default new ErrorController().handleError;
