import { badRequest, notFound, unauthorized, forbidden } from '../http/HttpError';
import { ServerException } from '../application/ServerException';

describe('HttpError helpers', () => {
  describe('badRequest', () => {
    it('should create a 400 ServerException', () => {
      const err = badRequest('Invalid input');
      expect(err).toBeInstanceOf(ServerException);
      expect(err.statusCode).toBe(400);
      expect(err.message).toBe('Invalid input');
    });

    it('should include details', () => {
      const err = badRequest('Fail', { field: 'email' });
      expect(err.details).toEqual({ field: 'email' });
    });
  });

  describe('notFound', () => {
    it('should create a 404 ServerException', () => {
      const err = notFound('Not here');
      expect(err).toBeInstanceOf(ServerException);
      expect(err.statusCode).toBe(404);
      expect(err.message).toBe('Not here');
    });
  });

  describe('unauthorized', () => {
    it('should create a 401 ServerException', () => {
      const err = unauthorized('No access');
      expect(err.statusCode).toBe(401);
    });
  });

  describe('forbidden', () => {
    it('should create a 403 ServerException', () => {
      const err = forbidden('Denied');
      expect(err.statusCode).toBe(403);
    });
  });
});
