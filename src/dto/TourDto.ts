import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsDate,
  IsMongoId
} from 'class-validator';
import { Type } from 'class-transformer';

// Enums
export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  DIFFICULT = 'difficult'
}

// GeoJSON interfaces
export class GeoLocationDto {
  @IsString()
  type!: string; // 'Point'

  @IsArray()
  @IsNumber({}, { each: true })
  coordinates!: [number, number]; // [longitude, latitude]

  @IsString()
  address!: string;

  @IsString()
  description!: string;
}

export class TourLocationDto extends GeoLocationDto {
  @IsNumber()
  day!: number;
}

export class CreateTourDto {
  @IsString()
  name!: string;

  @IsNumber()
  duration!: number;

  @IsNumber()
  maxGroupSize!: number;

  @IsEnum(Difficulty)
  difficulty!: Difficulty;

  @IsNumber()
  price!: number;

  @IsOptional()
  @IsNumber()
  priceDiscount?: number;

  @IsString()
  summary!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  imageCover!: string;

  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @IsArray()
  @Type(() => Date)
  startDates!: Date[];

  @ValidateNested()
  @Type(() => GeoLocationDto)
  startLocation!: GeoLocationDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TourLocationDto)
  locations!: TourLocationDto[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  guides?: string[];
}

export class UpdateTourDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNumber()
  maxGroupSize?: number;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  priceDiscount?: number;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageCover?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @Type(() => Date)
  startDates?: Date[];

  @IsOptional()
  @ValidateNested()
  @Type(() => GeoLocationDto)
  startLocation?: GeoLocationDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TourLocationDto)
  locations?: TourLocationDto[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  guides?: string[];
}

// // Base interface for schema properties (without refs)
// export interface ITourSchemaBase {
//   name: string;
//   slug: string;
//   duration: number;
//   maxGroupSize: number;
//   difficulty: Difficulty;
//   ratingsAverage: number;
//   ratingsQuantity: number;
//   price: number;
//   priceDiscount?: number;
//   summary: string;
//   description?: string;
//   imageCover: string;
//   images: string[];
//   createdAt: Date;
//   startDates: Date[];
//   secretTour: boolean;
//   startLocation: IGeoLocation;
//   locations: ITourLocation[];
// }

// // Base interface for Tour properties (with refs)
// export interface ITourBase extends ITourSchemaBase {
//   guides: Array<mongoose.Types.ObjectId> | Array<IUserDocument>;
// }

// // Interface for Tour document with methods
// export interface ITour extends mongoose.Document, ITourBase {
//   durationWeeks?: number; // Virtual
//   reviews?: IReview[]; // Virtual populated
// }

// // Static methods for Tour Model
// export interface ITourModel extends mongoose.Model<ITour> {
//   // Add static methods here if needed
// }

// // Request DTOs
// export interface CreateTourDto
//   extends Omit<
//     ITourSchemaBase,
//     'slug' | 'ratingsAverage' | 'ratingsQuantity' | 'createdAt' | 'secretTour'
//   > {
//   guides?: string[]; // Guide IDs for creation
// }

// export interface UpdateTourDto extends Partial<CreateTourDto> {}

// // Response DTOs
// export interface ITourResponseDto extends Omit<ITourDocument, 'guides'> {
//   guides: IUserDocument; // Populated guides
//   durationWeeks: number;
//   reviews?: IReview[];
// }

// // Stats interfaces
// export interface ITourStats {
//   difficulty: Difficulty;
//   numTours: number;
//   numRatings: number;
//   avgRating: number;
//   avgPrice: number;
//   minPrice: number;
//   maxPrice: number;
// }

// export interface IMonthlyPlan {
//   month: number; // month
//   numTourStarts: number;
//   tours: Array<Pick<ITour, '_id' | 'name'>>;
// }
