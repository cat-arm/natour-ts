import express from 'express';
import authController from '../controller/authController';
import bookingController from '../controller/bookingController';

const router = express.Router();

// Protect all routes below
router.use(authController.protect);

// Checkout session (public route after login)
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);
// router.route('/checkout-session/:tourId').post(
//   express.raw({ type: 'application/json' }), // raw body only webhook
//   bookingController.webhookCheckout
// );

// Restrict to admin and lead-guide for all routes below
router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

export default router;
