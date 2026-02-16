import { BudgetVehiclePartEntity } from './BudgetVehiclePart';

export interface IBudgetVehiclePartRepository {
  create(entity: BudgetVehiclePartEntity): Promise<BudgetVehiclePartEntity>;
  bulkCreate(entities: BudgetVehiclePartEntity[]): Promise<BudgetVehiclePartEntity[]>;
  listByBudget(budgetId: number): Promise<BudgetVehiclePartEntity[]>;
  updateQuantity(id: number, quantity: number): Promise<void>;
  deleteByIds(ids: number[]): Promise<void>;
}
