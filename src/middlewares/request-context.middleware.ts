import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export const requestContext = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  req.id = req.header('X-Request-ID') ?? randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
};
