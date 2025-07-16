import { Router } from 'express';
import authController from '../controller/authController';
import reviewController from '../controller/reviewController';
import { validateDto } from '../middleware/validateDto';
import { CreateReviewDto, UpdateReviewDto } from '../dto/reviewDto';

const router = Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    validateDto(CreateReviewDto),
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    validateDto(UpdateReviewDto),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Get all reviews
 *     tags: [Review]
 *     security:
 *       - bearerAuth: [eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzdjNTVjODM4Yjg1YWQwMGNjYjdhMyIsImlhdCI6MTc1MjY3OTc3NiwiZXhwIjoxNzYwNDU1Nzc2fQ.eUdNzhxgVz7y3AYF-hlc7So_pp0NxCf4zg0jU6snOT8]
 *     responses:
 *       200:
 *         description: List of all reviews
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
 *                   example: 60
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
 * /reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Review]
 *     security:
 *       - bearerAuth: [eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzdjNTVjODM4Yjg1YWQwMGNjYjdhMyIsImlhdCI6MTc1MjY3OTc3NiwiZXhwIjoxNzYwNDU1Nzc2fQ.eUdNzhxgVz7y3AYF-hlc7So_pp0NxCf4zg0jU6snOT8]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - review
 *               - rating
 *               - tour
 *               - user
 *             properties:
 *               review:
 *                 type: string
 *                 example: So cool
 *               rating:
 *                 type: integer
 *                 example: 4
 *               tour:
 *                 type: string
 *                 example: 5c88fa8cf4afda39709c2961
 *               user:
 *                 type: string
 *                 example: 6873de73b4d5e654feaed3f0
 *     responses:
 *       200:
 *         description: Review created successfully
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
 *                       review: So cool
 *                       rating: 4
 *                       tour: 5c88fa8cf4afda39709c2961
 *                       user: 6873de73b4d5e654feaed3f0
 *                       _id: 687670fa80a43b031da46f5f
 *                       createdAt: 2025-07-15T15:17:14.315Z
 *                       __v: 0
 *                       id: 687670fa80a43b031da46f5f
 */

/**
 * @swagger
 * /reviews/{id}:
 *   patch:
 *     summary: Update a review
 *     tags: [Review]
 *     security:
 *       - bearerAuth: [eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzdjNTVjODM4Yjg1YWQwMGNjYjdhMyIsImlhdCI6MTc1MjY3OTc3NiwiZXhwIjoxNzYwNDU1Nzc2fQ.eUdNzhxgVz7y3AYF-hlc7So_pp0NxCf4zg0jU6snOT8]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         example: 687670fa80a43b031da46f5f
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               review:
 *                 type: string
 *                 example: test test test
 *               rating:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Review updated successfully
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
 *                       _id: 5c8a34ed14eb5c17645c9108
 *                       review: Cras mollis nisi parturient mi nec aliquet suspendisse sagittis eros condimentum scelerisque taciti mattis praesent feugiat eu nascetur a tincidunt
 *                       rating: 5
 *                       tour: 5c88fa8cf4afda39709c2955
 *                       user:
 *                         _id: 5c8a1dfa2f8fb814b56fa181
 *                         name: Lourdes Browning
 *                         photo: user-2.jpg
 *                       createdAt: 2025-07-13T14:28:31.349Z
 *                       __v: 0
 *                       id: 5c8a34ed14eb5c17645c9108
 */

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Review]
 *     security:
 *       - bearerAuth: [eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzdjNTVjODM4Yjg1YWQwMGNjYjdhMyIsImlhdCI6MTc1MjY3OTc3NiwiZXhwIjoxNzYwNDU1Nzc2fQ.eUdNzhxgVz7y3AYF-hlc7So_pp0NxCf4zg0jU6snOT8]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         example: 687670fa80a43b031da46f5f
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       204:
 *         description: Review deleted successfully
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         review:
 *           type: string
 *         rating:
 *           type: integer
 *         tour:
 *           type: string
 *         user:
 *           oneOf:
 *             - type: string
 *             - type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 photo:
 *                   type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         __v:
 *           type: integer
 *         id:
 *           type: string
 */

export default router;
