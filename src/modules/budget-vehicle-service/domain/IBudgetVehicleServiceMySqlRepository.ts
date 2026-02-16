import { BudgetVehicleServiceEntity, BudgetVehicleServiceId } from './BudgetVehicleServiceEntity';

export interface IBudgetVehicleServiceMySqlRepository {
  create(budgetVehicleService: BudgetVehicleServiceEntity): Promise<BudgetVehicleServiceEntity>;
  findById(id: BudgetVehicleServiceId): Promise<BudgetVehicleServiceEntity | null>;
  update(id: BudgetVehicleServiceId, partial: Partial<BudgetVehicleServiceEntity['toJSON'] extends () => infer T ? T : never>): Promise<BudgetVehicleServiceEntity | null>;
  delete(id: BudgetVehicleServiceId): Promise<void>;
}
