import {
  ServerException,
  NotFoundServerException,
  BadRequestServerException,
  ForbiddenServerException,
  UnauthorizedServerException,
} from '../application/ServerException';

describe('ServerException', () => {
  it('should create with statusCode and message', () => {
    const err = new ServerException(500, 'Something went wrong');
    expect(err.statusCode).toBe(500);
    expect(err.message).toBe('Something went wrong');
    expect(err.name).toBe('ServerException');
    expect(err.details).toBeUndefined();
  });

  it('should create with details', () => {
    const err = new ServerException(400, 'Bad', { field: 'name' });
    expect(err.details).toEqual({ field: 'name' });
  });

  it('should be an instance of Error', () => {
    const err = new ServerException(500, 'test');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('NotFoundServerException', () => {
  it('should default to 404 and Not found', () => {
    const err = new NotFoundServerException();
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Not found');
  });

  it('should accept custom message and details', () => {
    const err = new NotFoundServerException('Item not found', { id: 1 });
    expect(err.message).toBe('Item not found');
    expect(err.details).toEqual({ id: 1 });
  });
});

describe('BadRequestServerException', () => {
  it('should default to 400 and Bad request', () => {
    const err = new BadRequestServerException();
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Bad request');
  });
});

describe('ForbiddenServerException', () => {
  it('should default to 403 and Forbidden', () => {
    const err = new ForbiddenServerException();
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('Forbidden');
  });
});

describe('UnauthorizedServerException', () => {
  it('should default to 401 and Unauthorized', () => {
    const err = new UnauthorizedServerException();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Unauthorized');
  });
});
