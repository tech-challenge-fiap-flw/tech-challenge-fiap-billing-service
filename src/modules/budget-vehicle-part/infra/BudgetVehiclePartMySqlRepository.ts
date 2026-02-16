import * as mysql from '../../../infra/db/mysql';
import { BudgetVehiclePartEntity } from '../domain/BudgetVehiclePart';
import { IBudgetVehiclePartRepository } from '../domain/IBudgetVehiclePartRepository';

export class BudgetVehiclePartMySqlRepository implements IBudgetVehiclePartRepository {
  async create(entity: BudgetVehiclePartEntity): Promise<BudgetVehiclePartEntity> {
    const data = entity.toJSON();

    const sql = `
      INSERT INTO budget_vehicle_parts (budgetId, vehiclePartId, quantity)
      VALUES (?, ?, ?)
    `;

    const params = [data.budgetId, data.vehiclePartId, data.quantity];

    const result = await mysql.insertOne(sql, params);

    return BudgetVehiclePartEntity.restore({
      ...data,
      id: result.insertId
    });
  }

  async bulkCreate(entities: BudgetVehiclePartEntity[]): Promise<BudgetVehiclePartEntity[]> {
    const created: BudgetVehiclePartEntity[] = [];

    for (const e of entities) {
      created.push(await this.create(e));
    }

    return created;
  }

  async listByBudget(budgetId: number): Promise<BudgetVehiclePartEntity[]> {
    const rows = await mysql.query<any>(
      `SELECT * FROM budget_vehicle_parts WHERE budgetId = ?`,
      [budgetId]
    );

    return rows.map(r => 
      BudgetVehiclePartEntity.restore(r)
    );
  }

  async updateQuantity(id: number, quantity: number): Promise<void> {
    await mysql.update(
      `UPDATE budget_vehicle_parts SET quantity = ? WHERE id = ?`,
      [quantity, id]
    );
  }

  async deleteByIds(ids: number[]): Promise<void> {
    if (!ids.length) {
      return;
    }

    const placeholders = ids.map(() => '?').join(',');

    await mysql.update(
      `DELETE FROM budget_vehicle_parts WHERE id IN (${placeholders})`,
      ids
    );
  }
}
