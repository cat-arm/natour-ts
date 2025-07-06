import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import bookingRouter from './routes/bookingRoutes';

import AppError from './utils/appError';
import tourRouter from './routes/tourRoutes';
import userRouter from './routes/userRoutes';
import reviewRouter from './routes/reviewRoutes';
import globalErrorHandler from './controller/errorController';

export interface CustomRequest extends Request {
  requestTime?: string;
}

const app = express();

// GLOBAL MIDDLEWARES
// Middleware 1: Set security HTTP headers ->
app.use(helmet());

// Middleware 2: check environment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middleware 3: Limit requests from same API -> prevent DDoS attacks
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// stripe more safe
app.post(
  '/api/v1/bookings/webhook-checkout',
  express.raw({ type: 'application/json' }), // raw body only webhook
  bookingRouter
);

// Middleware 4: Body parser, reading data from body into req.body -> limit request body size
app.use(express.json({ limit: '10kb' }));

// Middleware 5: Data sanitization against NoSQL query injection ($, .)
app.use(mongoSanitize());

// Middleware 6: Data sanitization against XSS(Cross-Site Scripting) -> prevent malicious HTML code
app.use(xss());

// Middleware 7: Prevent parameter pollution -> cannot use same parameter name more than once
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Middleware 8: Serve static files (images, videos, etc.) ex http://localhost:3000/logo.png -> public/img/logo.png
app.use(express.static(`${__dirname}/public`));

// Middleware 9: Add requestTime to req uest object
app.use((req: CustomRequest, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// Middleware 10: Handle unhandled routes
app.all('*', (req: CustomRequest, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
