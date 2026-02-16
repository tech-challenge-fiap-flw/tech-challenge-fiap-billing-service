import { BudgetEntity, BudgetId } from './Budget';
import { IBaseRepository } from '../../../shared/domain/BaseRepository'

export interface IBudgetRepository extends IBaseRepository {
  create(entity: BudgetEntity): Promise<BudgetEntity>;
  findById(id: BudgetId, userId?: number): Promise<BudgetEntity | null>;
}
