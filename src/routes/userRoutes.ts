import { Router } from 'express';
import authController from '../controller/authController';
import userController from '../controller/userController';
import { validateDto } from '../middleware/validateDto';
import { CreateUserDto, UpdateMeDto, UpdateUserDto } from '../dto/userDto';
import {
  LoginDto,
  ResetPasswordDto,
  SignupDto,
  UpdatePasswordDto
} from '../dto/authDto';

const router = Router();

router.post('/signup', validateDto(SignupDto), authController.signup);
router.post('/login', validateDto(LoginDto), authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch(
  '/resetPassword/:token',
  validateDto(ResetPasswordDto),
  authController.resetPassword
);

router.patch(
  '/updateMyPassword',
  authController.protect,
  validateDto(UpdatePasswordDto),
  authController.updatePassword
);

router.patch(
  '/updateMe',
  authController.protect,
  validateDto(UpdateMeDto),
  userController.updateMe
);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    validateDto(CreateUserDto),
    userController.createUser
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getUserById
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    validateDto(UpdateUserDto),
    userController.updateUser
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUser
  );

export default router;
