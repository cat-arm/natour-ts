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

export default router;
