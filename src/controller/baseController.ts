import { Request, Response, NextFunction } from 'express';
import { Model, PopulateOptions } from 'mongoose';
import APIFeatures from '../utils/apiFeatures';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

// abstract base class for use in only subclass -> cant use direct new BaseController(User) have to extends
// public (default) can call method normally
// protected cam use in this class or subclass
// readonly read only camt adjust the value
// private use only this class can't call from outside --> cant use new BaseController(User);
// static not depend on instance -> pi = 3.714
export abstract class BaseController<T> {
  constructor(
    private model: Model<T>,
    // .populate('user') //string
    // .populate({ path: 'user', select: 'email' }) //PopulateOptions
    // .populate(['user', { path: 'tour' }]) //(string | PopulateOptions)[]
    private popOptions?: string | PopulateOptions | (string | PopulateOptions)[]
  ) {}
  protected getOne = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      let query = this.model.findById(req.params.id);

      // If popOptions are provided, apply the populate method to the query
      if (this.popOptions)
        query = query.populate(
          this.popOptions as PopulateOptions | (string | PopulateOptions)[]
        );

      const doc = await query;

      if (!doc) {
        return next(new AppError('No document found with that ID', 404));
      }

      res.status(200).json({
        status: 'success',
        data: {
          data: doc
        }
      });
    }
  );

  protected getAll = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // To allow for nested GET reviews on tour (hack)
      let filter = {};
      if (req.params.tourId) filter = { tour: req.params.tourId };

      const features = new APIFeatures(this.model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

      const doc = await features.query;

      res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
          data: doc
        }
      });
    }
  );

  protected createOne = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const newDoc = await this.model.create(req.body);

      res.status(201).json({
        status: 'success',
        data: {
          data: newDoc
        }
      });
    }
  );

  protected updateOne = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const doc = await this.model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });

      if (!doc) {
        return next(new AppError('No document found with that ID', 404));
      }

      res.status(200).json({
        status: 'success',
        data: {
          data: doc
        }
      });
    }
  );

  protected deleteOne = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const doc = await this.model.findByIdAndDelete(req.params.id);

      if (!doc) {
        return next(new AppError('No document found with that ID', 404));
      }

      res.status(204).json({
        status: 'success',
        data: null
      });
    }
  );
}
