import { NextFunction, Request, Response } from 'express';
import { verifyJwt, JwtPayload } from '../utils/jwt';
import { StatusCodes } from 'http-status-codes';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.substring('Bearer '.length);
  try {
    const payload = verifyJwt(token);
    req.user = payload;
    next();
  } catch {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid or expired token' });
  }
}


