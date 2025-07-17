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

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - passwordConfirm
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john10@example.com
 *               password:
 *                 type: string
 *                 example: test1234
 *               passwordConfirm:
 *                 type: string
 *                 example: test1234
 *     responses:
 *       201:
 *         description: Signup successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: success
 *                 token: eyJh...
 *                 data:
 *                   userObj:
 *                     _id: 6877c55c838b85ad00ccb7a3
 *                     name: John Doe
 *                     email: john12@example.com
 *                     role: user
 *                     active: true
 *                     __v: 0
 */
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john9@example.com
 *               password:
 *                 type: string
 *                 example: test1234
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token and user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                   example: eyJh...
 *                 data:
 *                   type: object
 *                   example:
 *                     userObj:
 *                       _id: 6873de73b4d5e654feaed3f0
 *                       name: John Doe
 *                       email: john9@example.com
 *                       role: user
 *                       __v: 0
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Incorrect email or password
 */
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: [eyJh...]
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                   example: eyJh...
 *                 data:
 *                   type: object
 *                   example:
 *                     userObj:
 *                       _id: 6873de73b4d5e654feaed3f0
 *                       name: John Doe
 *                       email: john9@example.com
 *                       role: user
 *                       __v: 0
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /users/updateMyPassword:
 *   patch:
 *     summary: Update current user's password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: [eyJh...]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - passwordCurrent
 *               - password
 *               - passwordConfirm
 *             properties:
 *               passwordCurrent:
 *                 type: string
 *                 example: test1234
 *               password:
 *                 type: string
 *                 example: newpassword123
 *               passwordConfirm:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password updated successfully, returns JWT token and user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                 data:
 *                   type: object
 *                   example:
 *                     userObj:
 *                       _id: 6873de73b4d5e654feaed3f0
 *                       name: John Doe
 *                       email: john9@example.com
 *                       role: user
 *                       __v: 0
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /users/logout:
 *   get:
 *     summary: Logout user (clear JWT cookie)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, guide, lead-guide, admin]
 *
 *     SignupDto:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - passwordConfirm
 *       properties:
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john10@example.com
 *         password:
 *           type: string
 *           example: test1234
 *         passwordConfirm:
 *           type: string
 *           example: test1234
 *
 *     LoginDto:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: john10@example.com
 *         password:
 *           type: string
 *           example: test1234
 *
 *     UpdatePasswordDto:
 *       type: object
 *       required:
 *         - passwordCurrent
 *         - password
 *         - passwordConfirm
 *       properties:
 *         passwordCurrent:
 *           type: string
 *           example: test1234
 *         password:
 *           type: string
 *           example: newpassword123
 *         passwordConfirm:
 *           type: string
 *           example: newpassword123
 */
