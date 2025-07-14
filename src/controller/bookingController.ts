import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import Tour from '../models/tourModel';
import Booking, { IBookingDocument } from '../models/bookingModel';
import catchAsync from '../utils/catchAsync';
import { BaseController } from './baseController';
import User from '../models/userModel';
import { AuthRequest } from './authController';
import { Email } from '../utils/email';

dotenv.config({ path: '.env' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

class BookingController extends BaseController<IBookingDocument> {
  constructor() {
    super(Booking);
  }
  // use handle function
  public getAllBookings = this.getAll;
  public getBooking = this.getOne;
  public createBooking = this.createOne;
  public updateBooking = this.updateOne;
  public deleteBooking = this.deleteOne;

  public getCheckoutSession = catchAsync(
    async (
      req: AuthRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      // get the currently tour
      const tour = await Tour.findById(req.params.tourId);
      if (!tour) {
        return next(new Error('No tour found with that ID'));
      }
      if (!req.user) {
        return next(new Error('No user in request'));
      }
      const user = await User.findById(req.user.id);
      if (!user) {
        return next(new Error('No user found with that ID'));
      }
      // create checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        // redirect after success payment and tel about tour, user, price to backend
        // success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
        //   req.params.tourId
        // }&user=${req.user.id}&price=${tour.price}`,
        success_url: `${req.protocol}://${req.get(
          'host'
        )}/my-tours?alert=booking`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: user.email,
        client_reference_id: req.params.tourId,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: tour.price * 100,
              product_data: {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [
                  `${req.protocol}://${req.get('host')}/img/tours/${
                    tour.imageCover
                  }`
                ]
              }
            },
            quantity: 1
          }
        ],
        mode: 'payment'
      });
      // create session as response
      res.status(200).json({
        status: 'success',
        session
      });
    }
  );

  private createBookingCheckout = async (
    session: Stripe.Checkout.Session
  ): Promise<void> => {
    const tour = session.client_reference_id;
    const userDoc = await User.findOne({ email: session.customer_email! });
    const price = session.amount_total ? session.amount_total / 100 : 0;

    if (tour && userDoc) {
      const user = userDoc?.id;
      const newBooking = await Booking.create({ tour, user, price });
      const email = new Email(
        userDoc,
        process.env.NODE_ENV === 'development'
          ? `http://localhost:${process.env.PORT}/api/v1/bookings/${newBooking._id}`
          : `${process.env.URL}`
      );
      await email.sendBookingConfirmation();
    }
  };

  public webhookCheckout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
      if (process.env.NODE_ENV === 'development') {
        event = req.body; // ใช้ body ตรง ๆ
      } else {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET as string
        );
      }
    } catch (err) {
      res.status(400).send(`Webhook error: ${(err as Error).message}`);
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.createBookingCheckout(session);
    }

    res.status(200).json({ received: true });
  };
}

export default new BookingController();
