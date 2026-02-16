import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { IVehicleServiceService } from '../../application/VehicleServiceService';
import { getPagination, toPage } from '../../../../shared/http/pagination';

export class ListVehicleServicesController implements IController {
  constructor(private readonly service: IVehicleServiceService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const { page, limit, offset } = getPagination(req.raw as any);

    const [items, total] = await Promise.all([
      this.service.list(offset, limit),
      this.service.countAll()
    ]);

    return {
      status: 200,
      body: toPage(items, page, limit, total)
    };
  }
}
