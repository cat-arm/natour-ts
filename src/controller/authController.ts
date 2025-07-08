import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import { Document } from 'mongoose';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { Email } from '../utils/email';
import User, { IUserDocument, UserRole } from '../models/userModel';
// DTOs
import {
  SignupDto,
  LoginDto,
  UpdatePasswordDto,
  ResetPasswordDto
} from '../dto/authDto';
import { promisify } from 'util';

interface IJwtPayload {
  id: string;
  iat: number;
  exp: number;
}

interface CookieOptions {
  expires: Date;
  httpOnly: boolean;
  secure?: boolean;
}

interface DecodedToken {
  id: string;
  iat: number;
}

type UserWithMethods = IUserDocument & Document;

class AuthController {
  private signToken(id: string): string {
    const options: SignOptions = {
      expiresIn: Number(process.env.JWT_EXPIRES_IN)
    };
    return jwt.sign({ id }, process.env.JWT_SECRET!, options);
  }

  private createSendToken(
    user: UserWithMethods,
    statusCode: number,
    res: Response
  ): void {
    const token = this.signToken(user._id.toString());
    const cookieOptions: CookieOptions = {
      expires: new Date(
        Date.now() +
          Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true;
    }

    res.cookie('jwt', token, cookieOptions);

    // Remove password from output
    const userObj = user.toObject();
    delete userObj.password;

    res.status(statusCode).json({
      status: 'success',
      token,
      data: { userObj }
    });
  }

  public signup = catchAsync(
    async (req: Request<{}, {}, SignupDto>, res: Response): Promise<void> => {
      const newUser = ((await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: UserRole.USER
      })) as unknown) as UserWithMethods;

      this.createSendToken(newUser, 201, res);
    }
  );

  public login = catchAsync(
    async (
      req: Request<{}, {}, LoginDto>,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      const { email, password } = req.body;

      // Check if email and password exist
      if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
      }

      // Check if user exists && password is correct
      const user = (await User.findOne({ email }).select(
        '+password'
      )) as UserWithMethods;

      if (
        !user ||
        !(await user.correctPassword(password, user.password as string))
      ) {
        return next(new AppError('Incorrect email or password', 401));
      }

      // If everything ok, send token to client
      this.createSendToken(user, 200, res);
    }
  );

  public logout = (req: Request<{}, {}, {}>, res: Response) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.status(200).json({ status: 'success' });
  };

  public protect = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // Getting token and check of it's there
      let token: string | undefined;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        return next(
          new AppError(
            'You are not logged in! Please log in to get access.',
            401
          )
        );
      }

      // Verification token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as DecodedToken;

      // Check if user still exists
      const currentUser = (await User.findById(decoded.id)) as UserWithMethods;
      if (!currentUser) {
        return next(
          new AppError(
            'The user belonging to this token does no longer exist.',
            401
          )
        );
      }

      // Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
          new AppError(
            'User recently changed password! Please log in again.',
            401
          )
        );
      }

      // GRANT ACCESS TO PROTECTED ROUTE
      req.user = {
        id: currentUser._id.toString(),
        role: currentUser.role
      };
      next();
    }
  );

  // use for view which everyone can use (even guest can view) but it show logined or logout in ui
  // isLoggedIn did not block but protect block
  public isLoggedIn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (req.cookies.jwt) {
      try {
        // verify token
        const decoded = await new Promise<JwtPayload>((resolve, reject) => {
          jwt.verify(
            req.cookies.jwt,
            process.env.JWT_SECRET!,
            (err: jwt.VerifyErrors | null, decoded: any) => {
              if (err || !decoded) return reject(err);
              resolve(decoded as JwtPayload);
            }
          );
        });

        // Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
          return next();
        }

        // Check if user changed password after the token was issued
        if (decoded.iat && currentUser.changedPasswordAfter(decoded.iat)) {
          return next();
        }

        // There is a logged in user
        res.locals.user = currentUser;
        return next();
      } catch (err) {
        return next();
      }
    }
    next();
  };

  public restrictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      // roles[('admin', 'lead-guide')].role = 'user';
      if (!req.user || !roles.includes(req.user.role)) {
        return next(
          new AppError('You do not have permission to perform this action', 403)
        );
      }
      next();
    };
  };

  public forgotPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // Get user based on POSTed email
      const user = (await User.findOne({
        email: req.body.email
      })) as UserWithMethods;
      if (!user) {
        return next(new AppError('There is no user with email address.', 404));
      }

      // Generate the random reset token
      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });

      try {
        // Send it to user's email
        const resetURL = `${req.protocol}://${req.get(
          'host'
        )}/api/v1/users/resetPassword/${resetToken}`;
        const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

        const email = new Email(user, resetURL);
        await email.sendPasswordReset();

        res.status(200).json({
          status: 'success',
          message: 'Token sent to email!'
        });
      } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
          new AppError(
            'There was an error sending the email. Try again later!',
            500
          )
        );
      }
    }
  );

  public resetPassword = catchAsync(
    async (
      req: Request<{}, {}, ResetPasswordDto>,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      const token = (req.params as { token: string }).token;

      // Get user based on the token
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const user = (await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      })) as UserWithMethods;

      // If token has not expired, and there is user, set the new password
      if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
      }

      user.password = req.body.password;
      user.passwordConfirm = req.body.passwordConfirm;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      // Update changedPasswordAt property for the user
      // Log the user in, send JWT
      this.createSendToken(user, 200, res);
    }
  );

  public updatePassword = catchAsync(
    async (
      req: Request<{}, {}, UpdatePasswordDto>,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      if (!req.user?.id) {
        return next(new AppError('Please log in to update password', 401));
      }

      // Get user from collection
      const user = (await User.findById(req.user.id).select(
        '+password'
      )) as UserWithMethods;
      if (!user) {
        return next(new AppError('User not found', 404));
      }

      // Check if POSTed current password is correct
      if (
        !(await user.correctPassword(
          req.body.passwordCurrent,
          user.password as string
        ))
      ) {
        return next(new AppError('Your current password is wrong.', 401));
      }

      // If so, update password
      user.password = req.body.password;
      user.passwordConfirm = req.body.passwordConfirm;
      await user.save();
      // User.findByIdAndUpdate will NOT work as intended!

      // Log user in, send JWT
      this.createSendToken(user, 200, res);
    }
  );
}

export default new AuthController();
