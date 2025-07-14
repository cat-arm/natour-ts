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
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch(
  '/resetPassword/:token',
  validateDto(ResetPasswordDto),
  authController.resetPassword
);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch(
  '/updateMyPassword',
  validateDto(UpdatePasswordDto),
  authController.updatePassword
);
router.get('/me', userController.getMe, userController.getUserById);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  validateDto(UpdateMeDto),
  userController.updateMe
);
router.patch(
  '/updatePhoto',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updatePhoto
);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(validateDto(CreateUserDto), userController.createUser);

router
  .route('/:id')
  .get(userController.getUserById)
  .patch(validateDto(UpdateUserDto), userController.updateUser)
  .delete(userController.deleteUser);

export default router;
