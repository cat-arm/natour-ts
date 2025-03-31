import mongoose from 'mongoose';

export interface TourDto {
  id: number;
  name: string;
  duration: number;
  price: number;
}

export interface NewTourDto extends TourDto {}

export interface ITour {
  name: string;
  slug: string;
  duration: number;
  maxGroupSize: number;
  difficulty: string;
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
  durationWeeks?: number;
}
