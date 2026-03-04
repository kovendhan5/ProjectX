import { NextFunction, Request, Response } from 'express';
import logger from '../config/logger';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error({ err, statusCode: err.statusCode }, 'Unhandled error');

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
  });
};

