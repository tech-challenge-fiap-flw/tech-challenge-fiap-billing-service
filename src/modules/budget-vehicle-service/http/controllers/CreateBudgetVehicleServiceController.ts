import { badRequest } from '../../../../shared/http/HttpError';
import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { IBudgetVehicleServiceService } from '../../application/BudgetVehicleServiceService';
import { createVehicleServiceSchema } from './schemas';

export class CreateBudgetVehicleServiceController implements IController {
  constructor(private readonly service: IBudgetVehicleServiceService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = createVehicleServiceSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    const result = await this.service.create(parsed.data);

    return {
      status: 201,
      body: result
    };
  }
}
