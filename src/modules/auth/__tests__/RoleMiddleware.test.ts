import { Request, Response, NextFunction } from 'express';
import { requireRole } from '../RoleMiddleware';

describe('requireRole', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  let statusFn: jest.Mock;
  let jsonFn: jest.Mock;

  beforeEach(() => {
    jsonFn = jest.fn();
    statusFn = jest.fn().mockReturnValue({ json: jsonFn });
    req = {};
    res = { status: statusFn } as any;
    next = jest.fn();
  });

  it('should return 401 when no user in request', () => {
    const middleware = requireRole('admin');
    middleware(req as Request, res as Response, next);

    expect(statusFn).toHaveBeenCalledWith(401);
    expect(jsonFn).toHaveBeenCalledWith({ error: 'Não autenticado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 when user type is not in allowed roles', () => {
    (req as any).user = { type: 'customer' };
    const middleware = requireRole('admin');
    middleware(req as Request, res as Response, next);

    expect(statusFn).toHaveBeenCalledWith(403);
    expect(jsonFn).toHaveBeenCalledWith({ error: 'Acesso negado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next when user has a valid role', () => {
    (req as any).user = { type: 'admin' };
    const middleware = requireRole('admin');
    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('should accept multiple roles', () => {
    (req as any).user = { type: 'manager' };
    const middleware = requireRole('admin', 'manager');
    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });
});
