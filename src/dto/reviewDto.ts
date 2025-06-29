import {
  IsString,
  IsNumber,
  Min,
  Max,
  IsMongoId,
  IsOptional
} from 'class-validator';

export class CreateReviewDto {
  @IsString()
  review!: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsMongoId()
  tour!: string;

  @IsMongoId()
  user!: string;
}

export class UpdateReviewDto {
  @IsOptional()
  @IsString()
  review?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;
}

// import mongoose from 'mongoose';
// import { IUser, IUserBase } from './userDto';
// import { ITour, ITourBase } from './tourDto';

// // Base interface for Review properties
// export interface IReviewBase {
//   review: string;
//   rating: number;
//   createdAt: Date;
//   tour: mongoose.Types.ObjectId | ITour;
//   user: mongoose.Types.ObjectId | IUser;
// }
// export interface IReviewBase {
//   review: string;
//   rating: number;
//   createdAt: Date;
//   tour: mongoose.Types.ObjectId;
//   user: mongoose.Types.ObjectId | IUserDocument;
// }

// // Interface for Review document with methods
// export interface IReview
//   extends mongoose.Document<mongoose.Types.ObjectId, {}, IReviewBase>,
//     IReviewBase {
//   // Document methods if any
// }

// // Static methods for Review Model
// export interface IReviewModel extends mongoose.Model<IReview> {
//   calcAverageRatings(tourId: mongoose.Types.ObjectId): Promise<void>;
// }

// // Stats returned by aggregation pipeline
// export interface IReviewStats {
//   _id: mongoose.Types.ObjectId;
//   nRating: number;
//   avgRating: number;
// }

// // Request DTOs
// export interface CreateReviewDto {
//   review: string;
//   rating: number;
//   tour: string;
//   user: string;
// }

// // partial change everything in pick to optional
// export interface UpdateReviewDto
//   extends Partial<Pick<IReviewBase, 'review' | 'rating'>> {}

// // Response DTO
// export interface IReviewResponseDto extends Omit<IReview, 'tour' | 'user'> {
//   tour: ITourBase;
//   user: Pick<IUser, '_id' | 'name' | 'photo'>;
// }
