import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../AuthMiddleware';

jest.mock('jsonwebtoken');

describe('authMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  let statusFn: jest.Mock;
  let jsonFn: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jsonFn = jest.fn();
    statusFn = jest.fn().mockReturnValue({ json: jsonFn });
    req = { headers: {} };
    res = { status: statusFn } as any;
    next = jest.fn();
  });

  it('should return 401 when no authorization header', () => {
    authMiddleware(req as Request, res as Response, next);

    expect(statusFn).toHaveBeenCalledWith(401);
    expect(jsonFn).toHaveBeenCalledWith({ error: 'Token não fornecido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization header does not start with Bearer', () => {
    req.headers = { authorization: 'Basic abc123' };

    authMiddleware(req as Request, res as Response, next);

    expect(statusFn).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next and set user on valid token', () => {
    const payload = { sub: 1, email: 'test@test.com', type: 'admin' };
    (jwt.verify as jest.Mock).mockReturnValue(payload);
    req.headers = { authorization: 'Bearer valid-token' };

    authMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect((req as any).user).toEqual(payload);
  });

  it('should return 401 when token is invalid', () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid');
    });
    req.headers = { authorization: 'Bearer bad-token' };

    authMiddleware(req as Request, res as Response, next);

    expect(statusFn).toHaveBeenCalledWith(401);
    expect(jsonFn).toHaveBeenCalledWith({ error: 'Token inválido ou expirado' });
    expect(next).not.toHaveBeenCalled();
  });
});
