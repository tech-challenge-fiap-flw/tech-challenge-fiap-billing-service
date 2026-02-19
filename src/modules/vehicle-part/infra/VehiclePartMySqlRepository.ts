import { ResultSetHeader } from 'mysql2';
import * as mysql from '../../../infra/db/mysql';
import { VehiclePartEntity, VehiclePartId, VehiclePartProps } from '../domain/VehiclePart';
import { VehiclePartRepository } from '../domain/VehiclePartRepository';
import { BaseRepository } from '../../../shared/domain/BaseRepository';

export class VehiclePartMySqlRepository extends BaseRepository implements VehiclePartRepository {

  async create(part: VehiclePartEntity): Promise<VehiclePartEntity> {
    const data = part.toJSON();
    
    const sql = `INSERT INTO vehicle_parts (type, name, description, quantity, price, deletedAt, creationDate)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
                 
    const params = [
      data.type,
      data.name,
      data.description,
      data.quantity,
      data.price,
      data.deletedAt ?? null,
      data.creationDate ?? new Date()
    ];

    const result = await mysql.insertOne(sql, params);
    
    return VehiclePartEntity.restore({ id: result.insertId, ...data });
  }

  async findById(id: VehiclePartId): Promise<VehiclePartEntity | null> {
    const rows = await mysql.query(`SELECT * FROM vehicle_parts WHERE id = ?`, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return VehiclePartEntity.restore(rows[0] as VehiclePartProps);
  }

  async update(id: VehiclePartId, partial: Partial<VehiclePartProps>): Promise<VehiclePartEntity | null> {
    const keys = Object.keys(partial) as (keyof VehiclePartProps)[];

    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const params = keys.map((k) => (partial as any)[k]);
    params.push(id);

    await mysql.query(`UPDATE vehicle_parts SET ${setClause} WHERE id = ?`, params);
    
    return await this.findById(id);
  }

  async softDelete(id: VehiclePartId): Promise<void> {
    await mysql.query(`UPDATE vehicle_parts SET deletedAt = NOW() WHERE id = ?`, [id]);
  }

  async list(offset: number, limit: number): Promise<VehiclePartEntity[]> {
    const sql = `
      SELECT * FROM vehicle_parts
      WHERE deletedAt IS NULL
      ORDER BY id 
      LIMIT ${limit} OFFSET ${offset}
    `;

    const rows = await mysql.query(sql);
    
    return rows.map((row) => VehiclePartEntity.restore(row as VehiclePartProps));
  }

  async countAll(): Promise<number> {
    const rows = await mysql.query(`SELECT COUNT(*) AS count FROM vehicle_parts WHERE deletedAt IS NULL`);
    return Number(rows.at(0)?.count ?? 0);
  }
}
