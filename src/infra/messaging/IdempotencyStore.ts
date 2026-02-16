import * as mysql from '../db/mysql';
import { logger } from '../../utils/logger';

export class IdempotencyStore {
  async isProcessed(eventId: string): Promise<boolean> {
    const rows = await mysql.query<any>(
      'SELECT id FROM idempotency_keys WHERE event_id = ?',
      [eventId]
    );
    return rows.length > 0;
  }

  async markProcessed(eventId: string): Promise<void> {
    try {
      await mysql.insertOne(
        'INSERT INTO idempotency_keys (event_id) VALUES (?)',
        [eventId]
      );
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        logger.warn({ eventId }, 'Duplicate idempotency key');
        return;
      }
      throw err;
    }
  }
}
