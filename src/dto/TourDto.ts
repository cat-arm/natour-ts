import mongoose from 'mongoose';
import { IUser, IUserBase } from './UserDto';
import { IReview, IReviewBase } from './ReviewDto';

// Enums
export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  DIFFICULT = 'difficult'
}

// GeoJSON interfaces
export interface IGeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
  description: string;
}

export interface ITourLocation extends IGeoLocation {
  day: number;
}

// Base interface for schema properties (without refs)
export interface ITourSchemaBase {
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
  startLocation: IGeoLocation;
  locations: ITourLocation[];
}

// Base interface for Tour properties (with refs)
export interface ITourBase extends ITourSchemaBase {
  guides: mongoose.Types.ObjectId[] | IUserBase[];
}

// Interface for Tour document with methods
export interface ITour extends mongoose.Document<mongoose.Types.ObjectId, {}, ITourBase>, ITourBase {
  durationWeeks?: number; // Virtual
  reviews?: IReview[]; // Virtual populated
}

// Static methods for Tour Model
export interface ITourModel extends mongoose.Model<ITour> {
  // Add static methods here if needed
}

// Request DTOs
export interface CreateTourDto extends Omit<ITourSchemaBase, 
  | 'slug' 
  | 'ratingsAverage' 
  | 'ratingsQuantity' 
  | 'createdAt' 
  | 'secretTour'
> {
  guides?: string[]; // Guide IDs for creation
}

export interface UpdateTourDto extends Partial<CreateTourDto> {}

// Response DTOs
export interface ITourResponseDto extends Omit<ITour, 'guides'> {
  guides: IUser[]; // Populated guides
  durationWeeks: number;
  reviews?: IReview[];
}

// Stats interfaces
export interface ITourStats {
  difficulty: Difficulty;
  numTours: number;
  numRatings: number;
  avgRating: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
}

export interface IMonthlyPlan {
  month: number; // month
  numTourStarts: number;
  tours: Array<Pick<ITour, '_id' | 'name'>>;
}