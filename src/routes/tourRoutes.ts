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
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(validateDto(CreateTourDto), tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(validateDto(UpdateTourDto), tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

export default router;
