import { Request, Response, NextFunction } from 'express';
import Review, { IReviewDocument } from '../models/reviewModel';
import APIFeatures from '../utils/apiFeatures';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { BaseController } from './baseController';

class ReviewController extends BaseController<IReviewDocument> {
  constructor() {
    super(Review);
  }
  // use handle function
  public getAllReviews = this.getAll;
  public getReview = this.getOne;
  public createReview = this.createOne;
  public updateReview = this.updateOne;
  public deleteReview = this.deleteOne;

  public setTourUserIds = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!req.body.tour) req.body.tour = req.params.tourId;
      if (!req.user) {
        return next(new AppError('User not authenticated', 401));
      }
      if (!req.body.user) req.body.user = req.user.id;
      next();
    }
  );
}

export default new ReviewController();
