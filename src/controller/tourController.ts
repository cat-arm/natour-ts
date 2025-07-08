import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';
import Tour, { ITourDocument } from '../models/tourModel';
import APIFeatures from '../utils/apiFeatures';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { BaseController } from './baseController';

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

class TourController extends BaseController<ITourDocument> {
  constructor() {
    super(Tour);
  }

  public uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
  ]);

  // upload.single('image') req.file
  // upload.array('images', 5) req.files
  public resizeTourImages = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (
        !req.files ||
        !('imageCover' in req.files) ||
        !('images' in req.files)
      ) {
        return next();
      }
      if (!req.files.imageCover || !req.files.images) return next();

      // Cover image
      req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
      await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

      // Images
      req.body.images = [];
      await Promise.all(
        req.files.images.map(async (file, i) => {
          const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

          await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${filename}`);

          req.body.images.push(filename);
        })
      );

      next();
    }
  );

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
