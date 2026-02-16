import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { IPaymentService } from '../../application/PaymentService';

export class RejectPaymentController implements IController {
  constructor(private readonly service: IPaymentService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);

    const result = await this.service.rejectPayment(id);

    return {
      status: 200,
      body: result,
    };
  }
}
