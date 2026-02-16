import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller'
import { badRequest } from '../../../../shared/http/HttpError'
import { IBudgetVehiclePartService } from '../../application/BudgetVehiclePartService'
import { createSchema } from './schemas'

export class CreateBudgetVehiclePartController implements IController {
  constructor(private readonly service: IBudgetVehiclePartService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = createSchema.safeParse(req.body)

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format())
    }

    const created = await this.service.createMany(parsed.data)

    return {
      status: 201,
      body: created
    }
  }
}
