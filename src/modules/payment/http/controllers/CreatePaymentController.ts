import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { IPaymentService } from '../../application/PaymentService';
import { createPaymentSchema } from './schemas';

export class CreatePaymentController implements IController {
  constructor(private readonly service: IPaymentService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = createPaymentSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    const result = await this.service.createPayment(parsed.data);

    return {
      status: 201,
      body: result,
    };
  }
}
