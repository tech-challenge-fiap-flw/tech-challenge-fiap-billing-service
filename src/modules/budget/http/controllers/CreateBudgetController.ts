import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller'
import { badRequest } from '../../../../shared/http/HttpError'
import { IBudgetService } from '../../application/BudgetService'
import { createSchema } from './schemas'

export class CreateBudgetController implements IController {
  constructor(private readonly service: IBudgetService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = createSchema.safeParse(req.body)

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format())
    }

    const created = await this.service.create(parsed.data)

    return {
      status: 201,
      body: created
    }
  }
}
