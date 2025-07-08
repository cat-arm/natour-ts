import { Request, Response, NextFunction } from 'express';
import User, { IUserDocument } from '../models/userModel';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { BaseController } from './baseController';
import { UpdateMeDto } from '../dto/userDto';
import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';

// Define types for filtered object
interface FilteredObject {
  [key: string]: unknown;
}

// allowd
const filterObj = (
  obj: FilteredObject,
  ...allowedFields: string[]
): FilteredObject => {
  const newObj: FilteredObject = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

// multer config
const multerStorage = multer.memoryStorage();
const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('Not an image! Please upload only images.', 400) as any,
      false
    );
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

class UserController extends BaseController<IUserDocument> {
  constructor() {
    // send model into constructor of BaseController
    super(User);
  }
  public uploadUserPhoto = upload.single('photo');

  public resizeUserPhoto = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.file || !req.user) return next();

      req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

      await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

      next();
    }
  );

  // use base function but no need we can go to use methos in BaseController
  public getAllUsers = this.getAll;
  public getUserById = this.getOne;
  public createUser = this.createOne;
  public updateUser = this.updateOne;
  public deleteUser = this.deleteOne;

  // in express if use async await, it will not catch the error then we need to use catchAsync
  // public getAllUsers = catchAsync(
  //   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //     const users = await User.find();

  //     res.status(200).json({
  //       status: 'success',
  //       results: users.length,
  //       data: {
  //         users
  //       }
  //     });
  //   }
  // );

  public getMe = (
    req: Request<{}, {}, {}>,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return next(new AppError('You are not logged in!', 401));
    }
    (req.params as { id: string }).id = req.user.id;
    next();
  };

  public updateMe = catchAsync(
    async (
      req: Request<{}, {}, UpdateMeDto>,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      // Create error if user POSTs password data
      if (req.body.password || req.body.passwordConfirm) {
        return next(
          new AppError(
            'This route is not for password updates. Please use /updateMyPassword.',
            400
          )
        );
      }

      // Filter out unwanted fields
      const filteredBody = filterObj(
        req.body as FilteredObject,
        'name',
        'email'
      );

      // Update user document
      const updatedUser = await User.findByIdAndUpdate(
        req.user?.id,
        filteredBody,
        {
          new: true,
          runValidators: true
        }
      );

      res.status(200).json({
        status: 'success',
        data: {
          user: updatedUser
        }
      });
    }
  );

  public deleteMe = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      await User.findByIdAndUpdate(req.user?.id, { active: false });

      res.status(204).json({
        status: 'success',
        data: null
      });
    }
  );
}

export default new UserController();
