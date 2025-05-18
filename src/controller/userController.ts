import { Request, Response, NextFunction } from 'express';
import User from '../models/userModel';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

// Extend Request type to include user property
interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

// Define types for filtered object
interface FilteredObject {
  [key: string]: unknown
}

class UserController {
  private filterObj(obj: FilteredObject, ...allowedFields: string[]): FilteredObject {
    const newObj: FilteredObject = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  }

  // in express if use async await, it will not catch the error then we need to use catchAsync
  public getAllUsers = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const users = await User.find();

      res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
          users
        }
      });
    }
  );

  public updateMe = catchAsync(
    async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
      // 1) Create error if user POSTs password data
      if (req.body.password || req.body.passwordConfirm) {
        return next(
          new AppError(
            'This route is not for password updates. Please use /updateMyPassword.',
            400
          )
        );
      }

      // 2) Filter out unwanted fields
      const filteredBody = this.filterObj(req.body, 'name', 'email');

      // 3) Update user document
      const updatedUser = await User.findByIdAndUpdate(req.user?.id, filteredBody, {
        new: true,
        runValidators: true
      });

      res.status(200).json({
        status: 'success',
        data: {
          user: updatedUser
        }
      });
    }
  );

  public deleteMe = catchAsync(
    async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
      await User.findByIdAndUpdate(req.user?.id, { active: false });

      res.status(204).json({
        status: 'success',
        data: null
      });
    }
  );

  public getUser = (req: Request, res: Response): void => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };

  public createUser = (req: Request, res: Response): void => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined! Please use /signup instead.'
    });
  };

  public updateUser = (req: Request, res: Response): void => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };

  public deleteUser = (req: Request, res: Response): void => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };
}

export default new UserController();
