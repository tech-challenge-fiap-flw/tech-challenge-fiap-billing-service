import { Router } from 'express';

export const authRouter = Router();

authRouter.get('/validate', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ valid: false });
    return;
  }

  res.status(200).json({ valid: true, message: 'Use authMiddleware on protected routes' });
});
