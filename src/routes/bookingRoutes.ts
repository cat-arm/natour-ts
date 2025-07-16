import express from 'express';
import authController from '../controller/authController';
import bookingController from '../controller/bookingController';

const router = express.Router();

// Protect all routes below
router.use(authController.protect);

// Checkout session (public route after login)
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);
// webhook for stripe call back
router.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

router.route('/:id').get(bookingController.getBooking);

// Restrict to admin and lead-guide for all routes below
router.use(authController.restrictTo('admin', 'lead-guide'));

router.route('/').get(bookingController.getAllBookings);

router
  .route('/:id')
  .patch(bookingController.updateBooking)
  .post(bookingController.createBooking);

router.route('/:id').delete(bookingController.deleteBooking);

/**
 * @swagger
 * /bookings/checkout-session/{tourId}:
 *   get:
 *     summary: Create Stripe checkout session for a tour
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: [eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzdjNTVjODM4Yjg1YWQwMGNjYjdhMyIsImlhdCI6MTc1MjY3OTc3NiwiZXhwIjoxNzYwNDU1Nzc2fQ.eUdNzhxgVz7y3AYF-hlc7So_pp0NxCf4zg0jU6snOT8]
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         example: 6873c3fd5851927fa28b0253
 *         schema:
 *           type: string
 *         description: The tour ID
 *     responses:
 *       200:
 *         description: Stripe checkout session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 session:
 *                   type: object
 *                   example:
 *                     id: cs_test_a1OPfoHWIQMcD8Kw7KkzgYI9CGAOS0E6XotP7oWhJqS651tsb2u9rTdL0M
 *                     object: checkout.session
 *                     amount_total: 99900
 *                     currency: usd
 *                     customer_email: john10@example.com
 *                     payment_status: unpaid
 *                     url: ........
 *
 * /bookings/webhook-checkout:
 *   post:
 *     summary: Stripe webhook for checkout session
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: [eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzdjNTVjODM4Yjg1YWQwMGNjYjdhMyIsImlhdCI6MTc1MjY3OTc3NiwiZXhwIjoxNzYwNDU1Nzc2fQ.eUdNzhxgVz7y3AYF-hlc7So_pp0NxCf4zg0jU6snOT8]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               type: checkout.session.completed
 *               data:
 *                 object:
 *                   id: cs_test_a1OPfoHWIQMcD8Kw7KkzgYI9CGAOS0E6XotP7oWhJqS651tsb2u9rTdL0M
 *                   client_reference_id: 6873c3fd5851927fa28b0253
 *                   customer_email: john10@example.com
 *                   amount_total: 99900
 *                   payment_status: paid
 *     responses:
 *       200:
 *         description: Webhook received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 *
 * /bookings/{id}:
 *   get:
 *     summary: Get a booking by ID
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: [eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzdjNTVjODM4Yjg1YWQwMGNjYjdhMyIsImlhdCI6MTc1MjY3OTc3NiwiZXhwIjoxNzYwNDU1Nzc2fQ.eUdNzhxgVz7y3AYF-hlc7So_pp0NxCf4zg0jU6snOT8]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         example: 68766029a801c2942a273b2c
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   example:
 *                     data:
 *                       _id: 68766029a801c2942a273b2c
 *                       tour:
 *                         _id: 6873c3fd5851927fa28b0253
 *                         name: Arm Pa Tour Yaowarat Night na ja
 *                         guides: []
 *                         durationWeeks: null
 *                         id: 6873c3fd5851927fa28b0253
 *                       user:
 *                         _id: 687526dbf30c3936cf21faba
 *                         name: John Doe
 *                         email: john10@example.com
 *                         role: user
 *                         __v: 0
 *                         photo: user-687526dbf30c3936cf21faba-1752510136066.jpeg
 *                       price: 999
 *                       createdAt: 2025-07-15T14:04:27.328Z
 *                       paid: true
 *                       __v: 0
 *
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         tour:
 *           oneOf:
 *             - type: string
 *             - $ref: '#/components/schemas/Tour'
 *         user:
 *           oneOf:
 *             - type: string
 *             - type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 __v:
 *                   type: integer
 *                 photo:
 *                   type: string
 *         price:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         paid:
 *           type: boolean
 *         __v:
 *           type: integer
 */

export default router;
