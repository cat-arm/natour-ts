import { Request, Response, NextFunction } from 'express';

type ControllerFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

const catchAsync = (fn: ControllerFunction) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
