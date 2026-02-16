import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { IBudgetVehicleServiceService } from '../../application/BudgetVehicleServiceService';

export class DeleteBudgetVehicleServiceController implements IController {
  constructor(private readonly service: IBudgetVehicleServiceService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id)

    await this.service.delete(id);

    return {
      status: 204
    };
  }
}
