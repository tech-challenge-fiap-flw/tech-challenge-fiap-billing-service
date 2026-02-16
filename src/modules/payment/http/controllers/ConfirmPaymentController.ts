import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { IPaymentService } from '../../application/PaymentService';

export class ConfirmPaymentController implements IController {
  constructor(private readonly service: IPaymentService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);

    const result = await this.service.confirmPayment(id);

    return {
      status: 200,
      body: result,
    };
  }
}
