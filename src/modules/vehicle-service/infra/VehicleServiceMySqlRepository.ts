import { ResultSetHeader } from 'mysql2';
import * as mysql from '../../../infra/db/mysql';
import { VehicleServiceEntity, VehicleServiceId, VehicleServiceProps } from '../domain/VehicleService';
import { VehicleServiceRepository } from '../domain/VehicleServiceRepository';

export class VehicleServiceMySqlRepository implements VehicleServiceRepository {

  async create(entity: VehicleServiceEntity): Promise<VehicleServiceEntity> {
    const data = entity.toJSON();
    
    const sql = `INSERT INTO vehicle_services (name, price, description, deletedAt)
                 VALUES (?, ?, ?, ?)`;
                 
    const params = [
      data.name,
      data.price,
      data.description ?? null,
      data.deletedAt ?? null
    ];

    const result = await mysql.insertOne(sql, params);
    
    return VehicleServiceEntity.restore({ id: result.insertId, ...data });
  }

  async findById(id: VehicleServiceId): Promise<VehicleServiceEntity | null> {
    const rows = await mysql.query<VehicleServiceProps>(`SELECT * FROM vehicle_services WHERE id = ?`, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return VehicleServiceEntity.restore(rows[0]);
  }

  async update(id: VehicleServiceId, partial: Partial<VehicleServiceProps>): Promise<VehicleServiceEntity | null> {
    const keys = Object.keys(partial) as (keyof VehicleServiceProps)[];

    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const params = keys.map((k) => (partial as any)[k]);
    params.push(id);

    await mysql.query<ResultSetHeader>(`UPDATE vehicle_services SET ${setClause} WHERE id = ?`, params);
    
    return await this.findById(id);
  }

  async softDelete(id: VehicleServiceId): Promise<void> {
    await mysql.query<ResultSetHeader>(`UPDATE vehicle_services SET deletedAt = NOW() WHERE id = ?`, [id]);
  }

  async list(offset: number, limit: number): Promise<VehicleServiceEntity[]> {
    const sql = `
      SELECT * FROM vehicle_services
      WHERE deletedAt IS NULL
      ORDER BY id 
      LIMIT ${limit} OFFSET ${offset}
    `;

    const rows = await mysql.query<VehicleServiceProps>(sql);
    
    return rows.map((row) => VehicleServiceEntity.restore(row));
  }

  async countAll(): Promise<number> {
    const rows = await mysql.query<{ count: number }>(`SELECT COUNT(*) AS count FROM vehicle_services WHERE deletedAt IS NULL`);
    return Number(rows.at(0)?.count ?? 0);
  }
}
