import { BudgetEntity } from '../domain/Budget';
import { IBudgetRepository } from '../domain/IBudgetRepository';
import { IBudgetVehiclePartService } from '../../budget-vehicle-part/application/BudgetVehiclePartService';
import { IBudgetVehicleServiceService } from '../../budget-vehicle-service/application/BudgetVehicleServiceService';
import { IVehiclePartService } from '../../vehicle-part/application/VehiclePartService';
import { IVehicleServiceService } from '../../vehicle-service/application/VehicleServiceService';
import { ForbiddenServerException, NotFoundServerException } from '../../../shared/application/ServerException';
import { AuthPayload } from '../../../modules/auth/AuthMiddleware';
import { SqsPublisher } from '../../../infra/messaging/SqsPublisher';
import { EventTypes } from '../../../shared/events/EventTypes';
import { logger } from '../../../utils/logger';

export type VehiclePartQuantity = {
  vehiclePartId: number;
  quantity: number;
};

export type CreateBudgetInput = {
  description: string;
  ownerId: number;
  diagnosisId: number;
  vehicleParts: VehiclePartQuantity[];
  vehicleServicesIds?: number[];
};

export type UpdateBudgetInput = Partial<Omit<CreateBudgetInput, 'ownerId' | 'diagnosisId'>>;
export type BudgetOutput = ReturnType<BudgetEntity['toJSON']> & { vehicleParts?: { id: number; quantity: number }[] };

export interface IBudgetService {
  create(input: CreateBudgetInput): Promise<BudgetOutput>;
  findById(budgetId: number, user?: AuthPayload): Promise<BudgetOutput>;
}

export class BudgetService implements IBudgetService {
  private sqsPublisher: SqsPublisher | null;

  constructor(
    private readonly repo: IBudgetRepository,
    private readonly vehiclePartService: IVehiclePartService,
    private readonly budgetVehiclePartService: IBudgetVehiclePartService,
    private readonly vehicleServiceService: IVehicleServiceService,
    private readonly budgetVehicleServiceService: IBudgetVehicleServiceService,
    sqsPublisher?: SqsPublisher,
  ) {
    this.sqsPublisher = sqsPublisher || null;
  }

  async create(input: CreateBudgetInput): Promise<BudgetOutput> {
    return this.repo.transaction(async () => {
      const vehicleServices = await this.vehicleServiceService.findByIds(input.vehicleServicesIds || []);

      if (vehicleServices.length !== (input.vehicleServicesIds?.length || 0)) {
        throw new NotFoundServerException('Um ou mais serviços não foram encontrados');
      }

      const totalParts = await this.updateVehiclePart(input.vehicleParts);

      const totalServices = vehicleServices.reduce((sum, vs) => sum + (+vs.price), 0);

      const entity = BudgetEntity.create({
        description: input.description,
        ownerId: input.ownerId,
        diagnosisId: input.diagnosisId,
        total: totalParts + totalServices,
      });

      const created = await this.repo.create(entity);
      const budgetJson = created.toJSON();

      await this.budgetVehiclePartService.createMany({
        budgetId: budgetJson.id,
        parts: input.vehicleParts
      });

      if (input.vehicleServicesIds?.length) {
        await this.budgetVehicleServiceService.createMany({
          budgetId: budgetJson.id,
          vehicleServiceIds: input.vehicleServicesIds
        });
      }

      if (this.sqsPublisher) {
        await this.sqsPublisher.publish({
          eventType: EventTypes.BUDGET_CREATED,
          correlationId: String(budgetJson.id),
          payload: {
            budgetId: budgetJson.id,
            ownerId: budgetJson.ownerId,
            diagnosisId: budgetJson.diagnosisId,
            total: budgetJson.total,
          },
        });
      }

      return budgetJson as BudgetOutput;
    });
  }

  async findById(budgetId: number, user?: AuthPayload): Promise<BudgetOutput> {
    const userId = user ? this.checkUserPermission(user) : undefined;

    const budget = await this.repo.findById(budgetId, userId);

    if (!budget) {
      throw new NotFoundServerException('Budget not found');
    }

    return { ...budget.toJSON() } as BudgetOutput;
  }

  private async updateVehiclePart(vehicleParts: VehiclePartQuantity[]): Promise<number> {
    let totalParts = 0;

    for (const part of vehicleParts) {
      const vehiclePart = await this.vehiclePartService.findById(part.vehiclePartId);

      if (vehiclePart.quantity < part.quantity) {
        throw new ForbiddenServerException(`Insufficient quantity for vehicle part with id ${part.vehiclePartId}`);
      }

      vehiclePart.quantity -= part.quantity;
      totalParts += vehiclePart.price * part.quantity;

      await this.vehiclePartService.updateVehiclePart(Number(vehiclePart.id), { quantity: vehiclePart.quantity });
    }

    return totalParts;
  }

  private checkUserPermission(user: AuthPayload): number | undefined {
    return user.type !== 'admin' ? user.sub : undefined
  }
}
