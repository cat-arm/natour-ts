import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import tourRouter from './routes/tourRoutes';
import userRouter from './routes/userRoutes';

export interface CustomRequest extends Request {
  requestTime?: string;
}

const app = express();

// Middlewares check environment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// Custom middleware - Logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('Hello from the middleware!');
  next();
});

// Custom niddleware - Add requestTime to request object
app.use((req: CustomRequest, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

export default app;
