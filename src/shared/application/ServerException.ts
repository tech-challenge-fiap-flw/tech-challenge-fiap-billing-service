export class ServerException extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'ServerException';
  }
}

export class NotFoundServerException extends ServerException {
  constructor(message = 'Not found', details?: any) {
    super(404, message, details);
  }
}

export class BadRequestServerException extends ServerException {
  constructor(message = 'Bad request', details?: any) {
    super(400, message, details);
  }
}

export class ForbiddenServerException extends ServerException {
  constructor(message = 'Forbidden', details?: any) {
    super(403, message, details);
  }
}

export class UnauthorizedServerException extends ServerException {
  constructor(message = 'Unauthorized', details?: any) {
    super(401, message, details);
  }
}
