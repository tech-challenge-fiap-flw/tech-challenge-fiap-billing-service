import * as mysql from '../../../infra/db/mysql';
import { PaymentEntity, PaymentId, PaymentStatus, IPaymentProps } from '../domain/Payment';
import { IPaymentRepository } from '../domain/IPaymentRepository';

export class PaymentMySqlRepository implements IPaymentRepository {
  async create(payment: PaymentEntity): Promise<PaymentEntity> {
    const data = payment.toJSON();

    const sql = `INSERT INTO payments (budgetId, externalId, amount, status, method, payerEmail, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      data.budgetId,
      data.externalId,
      data.amount,
      data.status,
      data.method,
      data.payerEmail,
      data.createdAt,
      data.updatedAt,
    ];

    const result = await mysql.insertOne(sql, params);

    return PaymentEntity.restore({ ...data, id: result.insertId });
  }

  async findById(id: PaymentId): Promise<PaymentEntity | null> {
    const rows = await mysql.query(`SELECT * FROM payments WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return null;
    }

    return PaymentEntity.restore(rows[0] as IPaymentProps);
  }

  async findByBudgetId(budgetId: number): Promise<PaymentEntity | null> {
    const rows = await mysql.query(
      `SELECT * FROM payments WHERE budgetId = ? ORDER BY createdAt DESC LIMIT 1`,
      [budgetId]
    );

    if (rows.length === 0) {
      return null;
    }

    return PaymentEntity.restore(rows[0] as IPaymentProps);
  }

  async findByExternalId(externalId: string): Promise<PaymentEntity | null> {
    const rows = await mysql.query(
      `SELECT * FROM payments WHERE externalId = ?`,
      [externalId]
    );

    if (rows.length === 0) {
      return null;
    }

    return PaymentEntity.restore(rows[0] as IPaymentProps);
  }

  async updateStatus(id: PaymentId, status: PaymentStatus): Promise<PaymentEntity | null> {
    await mysql.update(
      `UPDATE payments SET status = ?, updatedAt = ? WHERE id = ?`,
      [status, new Date(), id]
    );

    return this.findById(id);
  }
}
