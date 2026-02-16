import { ServerException } from '../application/ServerException';

export function badRequest(message: string, details?: any) {
  return new ServerException(400, message, details);
}

export function notFound(message: string, details?: any) {
  return new ServerException(404, message, details);
}

export function unauthorized(message: string, details?: any) {
  return new ServerException(401, message, details);
}

export function forbidden(message: string, details?: any) {
  return new ServerException(403, message, details);
}
