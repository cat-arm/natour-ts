import { Request, Response, NextFunction } from 'express';
import factory from './handlerFactory';
import Tour from '../models/tourModel';
import APIFeatures from '../utils/apiFeatures';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

interface TourRequest extends Request {
  query: {
    limit?: string;
    sort?: string;
    fields?: string;
    [key: string]: any;
  };
}

class TourController {
  aliasTopTours(req: TourRequest, res: Response, next: NextFunction): void {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
  }

  // use handle function
  getAllTours = factory.getAll(Tour);
  getTour = factory.getOne(Tour, { path: 'reviews' });
  createTour = factory.createOne(Tour);
  updateTour = factory.updateOne(Tour);
  deleteTour = factory.deleteOne(Tour);

  getTourStats = catchAsync(
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

  getMonthlyPlan = catchAsync(
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
  getToursWithin = catchAsync(
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

  getDistances = catchAsync(
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
