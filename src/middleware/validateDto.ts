import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import AppError from '../utils/appError';

export const validateDto = (DtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoObject = plainToInstance(DtoClass, req.body);
    const errors = await validate(dtoObject);

    if (errors.length > 0) {
      const message = errors
        .map(err => Object.values(err.constraints || {}).join(', '))
        .join('; ');
      return next(new AppError(`Invalid input: ${message}`, 400));
    }

    next();
  };
};
