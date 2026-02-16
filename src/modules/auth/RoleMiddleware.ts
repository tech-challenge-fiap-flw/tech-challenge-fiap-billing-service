import { Request, Response, NextFunction } from 'express';

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }
    if (!roles.includes(user.type)) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }
    next();
  };
}
