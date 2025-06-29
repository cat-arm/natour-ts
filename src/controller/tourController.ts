import { Request, Response, NextFunction } from 'express';
import Tour, { ITourDocument } from '../models/tourModel';
import APIFeatures from '../utils/apiFeatures';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { BaseController } from './baseController';

class TourController extends BaseController<ITourDocument> {
  constructor() {
    super(Tour);
  }

  public aliasTopTours(req: Request, res: Response, next: NextFunction): void {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
  }

  public getAllTours = this.getAll;
  public getTour = this.getOne;
  public createTour = this.createOne;
  public updateTour = this.updateOne;
  public deleteTour = this.deleteOne;

  public getTourStats = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const stats = await Tour.aggregate([
        {
          $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
          $group: {
            _id: { $toUpper: '$difficulty' },
            numTours: { $sum: 1 },
            numRatings: { $sum: '$ratingsQuantity' },
            avgRating: { $avg: '$ratingsAverage' },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        },
        {
          $sort: { avgPrice: 1 }
        }
        // {
        //   $match: { _id: { $ne: 'EASY' } }
        // }
      ]);

      res.status(200).json({
        status: 'success',
        data: { stats }
      });
    }
  );

  public getMonthlyPlan = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const year = parseInt(req.params.year);

      const plan = await Tour.aggregate([
        {
          $unwind: '$startDates'
        },
        {
          $match: {
            startDates: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31`)
            }
          }
        },
        {
          $group: {
            _id: { $month: '$startDates' },
            numTourStarts: { $sum: 1 },
            tours: { $push: '$name' }
          }
        },
        {
          $addFields: { month: '$_id' }
        },
        {
          $project: {
            _id: 0
          }
        },
        {
          $sort: { numTourStarts: -1 }
        },
        {
          $limit: 12
        }
      ]);

      res.status(200).json({
        status: 'success',
        data: { plan }
      });
    }
  );

  // /tours-within/:distance/center/:latlng/unit/:unit
  // /tours-within/233/center/34.111745,-118.113491/unit/mi
  public getToursWithin = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { distance, latlng, unit } = req.params;
      const [latStr, lngStr] = latlng.split(',') || [];

      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);

      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        return next(
          new AppError(
            'Please provide latitude and longitude in the format lat,lng.',
            400
          )
        );
      }

      const distanceNum = Number(distance);
      if (isNaN(distanceNum)) {
        return next(new AppError('Distance must be a number.', 400));
      }

      const radius =
        unit === 'mi' ? distanceNum / 3963.2 : distanceNum / 6378.1;

      const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
      });

      res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
          data: tours
        }
      });
    }
  );

  public getDistances = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { latlng, unit } = req.params;
      const [latStr, lngStr] = latlng.split(',') || [];
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);

      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        return next(
          new AppError(
            'Please provide latitude and longitude in the format lat,lng.',
            400
          )
        );
      }

      const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
      const distances = await Tour.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [lng * 1, lat * 1]
            },
            distanceField: 'distance',
            distanceMultiplier: multiplier
          }
        },
        {
          $project: {
            distance: 1,
            name: 1
          }
        }
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          data: distances
        }
      });
    }
  );
}

export default new TourController();
