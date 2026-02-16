import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { IPaymentService } from '../../application/PaymentService';
import { webhookSchema } from './schemas';

export class PaymentWebhookController implements IController {
  constructor(private readonly service: IPaymentService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = webhookSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Invalid webhook payload', parsed.error.format());
    }

    const { externalId, status } = parsed.data;

    const result = await this.service.processWebhook(externalId, status);

    return {
      status: 200,
      body: result,
    };
  }
}
