import * as mysql from '../../../infra/db/mysql';
import { BudgetVehicleServiceEntity, BudgetVehicleServiceId, IBudgetVehicleServiceProps } from '../domain/BudgetVehicleServiceEntity';
import { IBudgetVehicleServiceMySqlRepository } from '../domain/IBudgetVehicleServiceMySqlRepository';

export class BudgetVehicleServiceMySqlRepository implements IBudgetVehicleServiceMySqlRepository {

  async create(budgetVehicleService: BudgetVehicleServiceEntity): Promise<BudgetVehicleServiceEntity> {
    const data = budgetVehicleService.toJSON();
    
    const sql = `INSERT INTO budget_vehicle_services (budgetId, vehicleServiceId, price)
                 VALUES (?, ?, ?)`;
                 
    const params = [
      data.budgetId,
      data.vehicleServiceId,
      data.price
    ];

    const result = await mysql.insertOne(sql, params);

    return BudgetVehicleServiceEntity.restore({ id: result.insertId, ...data });
  }

  async findById(id: BudgetVehicleServiceId): Promise<BudgetVehicleServiceEntity | null> {
    const rows = await mysql.query<IBudgetVehicleServiceProps>(`SELECT * FROM budget_vehicle_services WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return null;
    }

    return BudgetVehicleServiceEntity.restore(rows[0]);
  }

  async update(id: BudgetVehicleServiceId, partial: Partial<IBudgetVehicleServiceProps>): Promise<BudgetVehicleServiceEntity | null> {
    const keys = Object.keys(partial) as (keyof IBudgetVehicleServiceProps)[];

    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const params = keys.map((k) => (partial as any)[k]);
    params.push(id);

    await mysql.update(`UPDATE budget_vehicle_services SET ${setClause} WHERE id = ?`, params);

    return await this.findById(id);
  }

  async delete(id: BudgetVehicleServiceId): Promise<void> {
    await mysql.deleteByField('budget_vehicle_services', 'id', id);
  }
}
