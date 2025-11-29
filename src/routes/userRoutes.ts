import { Router, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { getUserProfile, updateUserProfile } from '../services/authService';

const router = Router();

router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const profile = await getUserProfile(req.user.sub);
    res.status(StatusCodes.OK).json({
      user: {
        id: req.user.sub,
        email: req.user.email,
        role: req.user.role
      },
      profile
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error in GET /users/me', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
});

router.put('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const { name, phone, preferences } = req.body ?? {};
    const updated = await updateUserProfile(req.user.sub, {
      name: name ?? undefined,
      phone: phone ?? undefined,
      preferences: preferences ?? undefined
    });
    res.status(StatusCodes.OK).json({
      user: {
        id: req.user.sub,
        email: req.user.email,
        role: req.user.role
      },
      profile: updated
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error in PUT /users/me', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
});

export default router;


