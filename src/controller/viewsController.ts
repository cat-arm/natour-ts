import { Request, Response, NextFunction } from 'express';
import Tour from '../models/tourModel';
import User from '../models/userModel';
import Booking from '../models/bookingModel';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { AuthRequest } from './authController';

// use for render html
class ViewController {
  public alerts = (req: Request, res: Response, next: NextFunction): void => {
    const { alert } = req.query;
    if (alert === 'booking') {
      res.locals.alert =
        "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediately, please come back later.";
    }
    next();
  };

  public getOverview = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      // Get tour data from collection
      const tours = await Tour.find();

      // Build template
      // Render that template using tour data from tours
      res.status(200).render('overview', {
        title: 'All Tours',
        tours
      });
    }
  );

  public getTour = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // Get the data, for the requested tour (including reviews and guides)
      const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        select: 'review rating user'
      });

      if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
      }
      // Build template
      // Render template using data from tour
      res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
      });
    }
  );

  public getLoginForm = (req: Request, res: Response): void => {
    res.status(200).render('login', {
      title: 'Log into your account'
    });
  };

  public getAccount = (req: Request, res: Response): void => {
    res.status(200).render('account', {
      title: 'Your account'
    });
  };

  public getMyTours = catchAsync(
    async (
      req: AuthRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      // Find all bookings
      const bookings = await Booking.find({ user: req.user!.id });

      // Find tours with the returned IDs
      const tourIDs = bookings.map(el => el.tour);
      const tours = await Tour.find({ _id: { $in: tourIDs } });

      res.status(200).render('overview', {
        title: 'My Tours',
        tours
      });
    }
  );

  // validate in mongo
  public updateUserData = catchAsync(
    async (
      req: AuthRequest & { body: { name: string; email: string } },
      res: Response
    ): Promise<void> => {
      const updatedUser = await User.findByIdAndUpdate(
        req.user!.id,
        {
          name: req.body.name,
          email: req.body.email
        },
        {
          new: true,
          runValidators: true
        }
      );

      res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser
      });
    }
  );
}

export default new ViewController();
