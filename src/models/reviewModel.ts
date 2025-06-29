import mongoose from 'mongoose';
import Tour, { ITourDocument } from './tourModel';
import { IUserDocument } from './userModel';

export interface IReviewDocument extends mongoose.Document {
  review: string;
  rating: number;
  createdAt: Date;
  tour: mongoose.Types.ObjectId | ITourDocument;
  user: mongoose.Types.ObjectId | IUserDocument;
}

export interface IReviewModel extends mongoose.Model<IReviewDocument> {
  calcAverageRatings(tourId: mongoose.Types.ObjectId): Promise<void>;
}

export interface IReviewStats {
  _id: mongoose.Types.ObjectId;
  nRating: number;
  avgRating: number;
}

const reviewSchema = new mongoose.Schema<IReviewDocument, IReviewModel>(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Query middleware
reviewSchema.pre(/^find/, function(
  this: mongoose.Query<IReviewDocument[], IReviewDocument>,
  next
) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

// Static method for calculating average ratings
reviewSchema.statics.calcAverageRatings = async function(
  this: IReviewModel,
  tourId: mongoose.Types.ObjectId
): Promise<void> {
  const stats = await this.aggregate<IReviewStats>([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

// Document middleware
reviewSchema.post('save', function(doc, next) {
  (this.constructor as IReviewModel).calcAverageRatings(
    this.tour as mongoose.Types.ObjectId
  );
  next();
});

// Query middleware for findOneAnd* operations
interface IReviewQueryWithReview
  extends mongoose.Query<IReviewDocument | null, IReviewDocument> {
  r?: IReviewDocument;
}

reviewSchema.pre(/^findOneAnd/, async function(
  this: IReviewQueryWithReview,
  next
) {
  const doc = await this.clone().findOne();
  if (doc) {
    this.r = doc;
  }
  next();
});

reviewSchema.post(/^findOneAnd/, async function(this: IReviewQueryWithReview) {
  if (this.r) {
    await (this.r.constructor as IReviewModel).calcAverageRatings(
      this.r.tour as mongoose.Types.ObjectId
    );
  }
});

// Create model with proper typing
const Review = mongoose.model<IReviewDocument, IReviewModel>(
  'Review',
  reviewSchema
);

export default Review;
