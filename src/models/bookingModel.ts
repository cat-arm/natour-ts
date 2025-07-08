import mongoose from 'mongoose';
import { ITourDocument } from './tourModel';
import { IUserDocument } from './userModel';

export interface IBookingDocument extends mongoose.Document {
  tour: mongoose.Types.ObjectId | ITourDocument;
  user: mongoose.Types.ObjectId | IUserDocument;
  price: number;
  createdAt: Date;
  paid: boolean;
}

export interface IBookingModel extends mongoose.Model<IBookingDocument> {}

const bookingSchema = new mongoose.Schema<IBookingDocument, IBookingModel>({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!']
  },
  price: {
    type: Number,
    require: [true, 'Booking must have a price.']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  paid: {
    type: Boolean,
    default: true
  }
});

bookingSchema.pre(/^find/, function(
  this: mongoose.Query<IBookingDocument[], IBookingDocument>,
  next
) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name'
  });
  next();
});

const Booking = mongoose.model<IBookingDocument, IBookingModel>(
  'Booking',
  bookingSchema
);

export default Booking;
