import mongoose, { Model } from 'mongoose';
import slugify from 'slugify';
import { Difficulty } from '../dto/tourDto';
import { IUserDocument } from './userModel';
// import validator from 'validator';

export interface ITourDocument extends mongoose.Document {
  name: string;
  slug: string;
  duration: number;
  maxGroupSize: number;
  difficulty: Difficulty;
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  priceDiscount?: number;
  summary: string;
  description?: string;
  imageCover: string;
  images: string[];
  createdAt: Date;
  startDates: Date[];
  secretTour: boolean;
  startLocation: {
    type: string;
    coordinates: [number, number];
    address: string;
    description: string;
  };
  locations: Array<{
    type: string;
    coordinates: [number, number];
    address: string;
    description: string;
    day: number;
  }>;
  guides: Array<mongoose.Types.ObjectId> | Array<IUserDocument>;

  // Virtual fields
  durationWeeks?: number;

  // Virtual populated
  reviews?: mongoose.Types.ObjectId[];
}

export interface ITourModel extends Model<ITourDocument> {}

// model for tour schema
const tourSchema = new mongoose.Schema<ITourDocument, ITourModel>(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: Object.values(Difficulty),
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val: number) => Math.round(val * 10) / 10 // 4.666666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        // this only points to current doc on NEW document creation
        validator: function(this: ITourDocument, val: number): boolean {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance queries
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// virtuals are not stored in the database, they are computed on the fly (only calculated when you access them)
tourSchema.virtual('durationWeeks').get(function(this: ITourDocument): number {
  return this.duration / 7;
});

// Virtual populate for reviews with the tour id
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() -> Pre-save hook to generate the slug
tourSchema.pre('save', function(this: ITourDocument, next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// DOCUMENT MIDDLEWARE: runs after .save() and .create() -> Post-save hook to log the document
// tourSchema.pre('save', function(next) {
//   console.log('Will save document...');
//   next();
// });

// DOCUMENT MIDDLEWARE: runs after .save() and .create() -> Post-save hook to log the document
// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// To exclude secret tours from all queries by default
interface IQueryWithTimer
  extends mongoose.Query<ITourDocument[], ITourDocument> {
  start?: number;
}

tourSchema.pre(/^find/, function(this: IQueryWithTimer, next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// Populate the guides field with the user model
tourSchema.pre(/^find/, function(
  this: mongoose.Query<ITourDocument[], ITourDocument>,
  next
) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

// Log query performance
tourSchema.post(/^find/, function(docs: ITourDocument[], next) {
  const timer = (this as unknown) as IQueryWithTimer;
  if (timer.start) {
    console.log(`Query took ${Date.now() - timer.start} milliseconds!`);
  }
  next();
});

// AGGREGATION MIDDLEWARE - To exclude secret tours from aggregation pipeline
// tourSchema.pre('aggregate', function(this: mongoose.Aggregate<any>, next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model<ITourDocument, ITourModel>('Tour', tourSchema);
export default Tour;
