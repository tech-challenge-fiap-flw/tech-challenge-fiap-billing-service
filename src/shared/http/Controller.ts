import { Request, Response } from 'express';

export interface HttpRequest {
  body: any;
  params: any;
  query: any;
  user?: any;
  raw: Request;
}

export interface HttpResponse {
  status: number;
  body?: any;
}

export interface IController {
  handle(req: HttpRequest): Promise<HttpResponse>;
}

export function adaptExpress(controller: IController) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const httpReq: HttpRequest = {
        body: req.body,
        params: req.params,
        query: req.query,
        user: (req as any).user,
        raw: req,
      };
      const httpRes = await controller.handle(httpReq);
      if (httpRes.body !== undefined) {
        res.status(httpRes.status).json(httpRes.body);
      } else {
        res.status(httpRes.status).send();
      }
    } catch (err: any) {
      const status = err.statusCode || err.status || 500;
      res.status(status).json({
        error: err.message || 'Internal Server Error',
        details: err.details || undefined,
      });
    }
  };
}
