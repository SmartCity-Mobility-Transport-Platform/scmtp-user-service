import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { loginUser, registerUser, AuthError } from '../services/authService';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body ?? {};
    const result = await registerUser({ email, password, name, phone });
    res.status(StatusCodes.CREATED).json(result);
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    // eslint-disable-next-line no-console
    console.error('Error in /auth/register', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Email and password are required' });
      return;
    }
    const result = await loginUser(email, password);
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    // eslint-disable-next-line no-console
    console.error('Error in /auth/login', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
});

export default router;


