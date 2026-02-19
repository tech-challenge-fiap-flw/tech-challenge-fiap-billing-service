import { adaptExpress, HttpRequest, HttpResponse, IController } from '../http/Controller';
import { Request, Response } from 'express';

describe('adaptExpress', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let statusFn: jest.Mock;
  let jsonFn: jest.Mock;
  let sendFn: jest.Mock;

  beforeEach(() => {
    jsonFn = jest.fn();
    sendFn = jest.fn();
    statusFn = jest.fn().mockReturnValue({ json: jsonFn, send: sendFn });

    mockReq = {
      body: { foo: 'bar' },
      params: { id: '1' },
      query: { page: '1' },
      user: undefined,
    } as any;

    mockRes = {
      status: statusFn,
    } as any;
  });

  it('should call controller.handle with mapped HttpRequest', async () => {
    const controller: IController = {
      handle: jest.fn().mockResolvedValue({ status: 200, body: { ok: true } }),
    };

    const handler = adaptExpress(controller);
    await handler(mockReq as Request, mockRes as Response);

    expect(controller.handle).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { foo: 'bar' },
        params: { id: '1' },
        query: { page: '1' },
      })
    );
  });

  it('should respond with status and body', async () => {
    const controller: IController = {
      handle: jest.fn().mockResolvedValue({ status: 200, body: { data: 'test' } }),
    };

    const handler = adaptExpress(controller);
    await handler(mockReq as Request, mockRes as Response);

    expect(statusFn).toHaveBeenCalledWith(200);
    expect(jsonFn).toHaveBeenCalledWith({ data: 'test' });
  });

  it('should respond with status only when no body', async () => {
    const controller: IController = {
      handle: jest.fn().mockResolvedValue({ status: 204 }),
    };

    const handler = adaptExpress(controller);
    await handler(mockReq as Request, mockRes as Response);

    expect(statusFn).toHaveBeenCalledWith(204);
    expect(sendFn).toHaveBeenCalled();
  });

  it('should handle errors with statusCode', async () => {
    const error = { statusCode: 400, message: 'Bad Request', details: { field: 'x' } };
    const controller: IController = {
      handle: jest.fn().mockRejectedValue(error),
    };

    const handler = adaptExpress(controller);
    await handler(mockReq as Request, mockRes as Response);

    expect(statusFn).toHaveBeenCalledWith(400);
    expect(jsonFn).toHaveBeenCalledWith({
      error: 'Bad Request',
      details: { field: 'x' },
    });
  });

  it('should default to 500 when error has no statusCode', async () => {
    const error = new Error('Unknown');
    const controller: IController = {
      handle: jest.fn().mockRejectedValue(error),
    };

    const handler = adaptExpress(controller);
    await handler(mockReq as Request, mockRes as Response);

    expect(statusFn).toHaveBeenCalledWith(500);
    expect(jsonFn).toHaveBeenCalledWith({
      error: 'Unknown',
      details: undefined,
    });
  });

  it('should pass user from req to HttpRequest', async () => {
    (mockReq as any).user = { sub: 1, email: 'test@test.com', type: 'admin' };

    const controller: IController = {
      handle: jest.fn().mockResolvedValue({ status: 200, body: {} }),
    };

    const handler = adaptExpress(controller);
    await handler(mockReq as Request, mockRes as Response);

    expect(controller.handle).toHaveBeenCalledWith(
      expect.objectContaining({
        user: { sub: 1, email: 'test@test.com', type: 'admin' },
      })
    );
  });
});
