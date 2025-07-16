import { Router } from 'express';
import tourController from '../controller/tourController';
import authController from '../controller/authController';
import reviewRouter from './reviewRoutes';
import { CreateTourDto, UpdateTourDto } from '../dto/tourDto';
import { validateDto } from '../middleware/validateDto';

const router = Router();

// router.param('id', tourController.checkID);

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    validateDto(CreateTourDto),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    validateDto(UpdateTourDto),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

export default router;

/**
 * @swagger
 * /tours:
 *   get:
 *     summary: Get all tours
 *     tags: [Tour]
 *     responses:
 *       200:
 *         description: List of all tours
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Tour'
 */

/**
 * @swagger
 * /tours/{id}:
 *   get:
 *     summary: Get a single tour by ID
 *     tags: [Tour]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         example: 5c88fa8cf4afda39709c2961
 *         schema:
 *           type: string
 *         description: The tour ID
 *     responses:
 *       200:
 *         description: Tour found
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
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Tour'
 *       404:
 *         description: Tour not found
 */

/**
 * @swagger
 * /tours/top-5-cheap:
 *   get:
 *     summary: Get top 5 cheapest tours
 *     tags: [Tour]
 *     responses:
 *       200:
 *         description: List of top 5 cheap tours
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Tour'
 */

/**
 * @swagger
 * /tours/tour-stats:
 *   get:
 *     summary: Get tour statistics
 *     tags: [Tour]
 *     responses:
 *       200:
 *         description: Tour statistics
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
 *                   properties:
 *                     stats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           difficulty:
 *                             type: string
 *                           numTours:
 *                             type: integer
 *                           numRatings:
 *                             type: integer
 *                           avgRating:
 *                             type: number
 *                           avgPrice:
 *                             type: number
 *                           minPrice:
 *                             type: number
 *                           maxPrice:
 *                             type: number
 */

/**
 * @swagger
 * /tours/tours-within/{distance}/center/{latlng}/unit/{unit}:
 *   get:
 *     summary: Get tours within a certain distance from a location
 *     tags: [Tour]
 *     parameters:
 *       - in: path
 *         name: distance
 *         required: true
 *         example: 10000
 *         schema:
 *           type: number
 *         description: Distance from center
 *       - in: path
 *         name: latlng
 *         required: true
 *         example: -40,45
 *         schema:
 *           type: string
 *         description: Latitude and longitude (format lat,lng)
 *       - in: path
 *         name: unit
 *         required: true
 *         example: mi
 *         schema:
 *           type: string
 *           enum: [mi, km]
 *         description: Unit of distance (mi or km)
 *     responses:
 *       200:
 *         description: List of tours within the specified distance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Tour'
 */

/**
 * @swagger
 * /tours/distances/{latlng}/unit/{unit}:
 *   get:
 *     summary: Get distances to all tours from a location
 *     tags: [Tour]
 *     parameters:
 *       - in: path
 *         name: latlng
 *         required: true
 *         example: -40,45
 *         schema:
 *           type: string
 *         description: Latitude and longitude (format lat,lng)
 *       - in: path
 *         name: unit
 *         required: true
 *         example: mi
 *         schema:
 *           type: string
 *           enum: [mi, km]
 *         description: Unit of distance (mi or km)
 *     responses:
 *       200:
 *         description: Distances to all tours
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
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           distance:
 *                             type: number
 *                           name:
 *                             type: string
 */

/**
 * @swagger
 * /tours/{tourId}/reviews:
 *   get:
 *     summary: Get all reviews for a tour
 *     tags: [Tour]
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         example: 5c88fa8cf4afda39709c2961
 *         schema:
 *           type: string
 *         description: The tour ID
 *     responses:
 *       200:
 *         description: List of reviews for the tour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Review'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Tour:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         duration:
 *           type: integer
 *         maxGroupSize:
 *           type: integer
 *         difficulty:
 *           type: string
 *         ratingsAverage:
 *           type: number
 *         ratingsQuantity:
 *           type: integer
 *         price:
 *           type: number
 *         summary:
 *           type: string
 *         description:
 *           type: string
 *         imageCover:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         startDates:
 *           type: array
 *           items:
 *             type: string
 *             format: date-time
 *         startLocation:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *             address:
 *               type: string
 *             description:
 *               type: string
 *         locations:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               coordinates:
 *                 type: array
 *                 items:
 *                   type: number
 *               address:
 *                 type: string
 *               description:
 *                 type: string
 *               day:
 *                 type: integer
 *               _id:
 *                 type: string
 *               id:
 *                 type: string
 *         guides:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               photo:
 *                 type: string
 *               role:
 *                 type: string
 *         slug:
 *           type: string
 *         __v:
 *           type: integer
 *         durationWeeks:
 *           type: number
 *         id:
 *           type: string
 */
