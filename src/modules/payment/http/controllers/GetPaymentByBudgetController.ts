import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { IPaymentService } from '../../application/PaymentService';

export class GetPaymentByBudgetController implements IController {
  constructor(private readonly service: IPaymentService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const budgetId = Number(req.params.budgetId);

    const result = await this.service.findByBudgetId(budgetId);

    return {
      status: 200,
      body: result,
    };
  }
}
