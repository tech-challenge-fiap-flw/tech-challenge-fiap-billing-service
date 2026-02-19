jest.mock('../../infra/db/mysql', () => ({
  query: jest.fn(),
  insertOne: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { IdempotencyStore } from '../messaging/IdempotencyStore';
import * as mysql from '../db/mysql';

const mockQuery = mysql.query as jest.Mock;
const mockInsertOne = mysql.insertOne as jest.Mock;

describe('IdempotencyStore', () => {
  let store: IdempotencyStore;

  beforeEach(() => {
    jest.clearAllMocks();
    store = new IdempotencyStore();
  });

  describe('isProcessed', () => {
    it('should return true when event exists', async () => {
      mockQuery.mockResolvedValue([{ id: 1 }]);

      const result = await store.isProcessed('event-1');
      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT id FROM idempotency_keys WHERE event_id = ?',
        ['event-1']
      );
    });

    it('should return false when event does not exist', async () => {
      mockQuery.mockResolvedValue([]);

      const result = await store.isProcessed('event-2');
      expect(result).toBe(false);
    });
  });

  describe('markProcessed', () => {
    it('should insert the event id', async () => {
      mockInsertOne.mockResolvedValue({});

      await store.markProcessed('event-3');

      expect(mockInsertOne).toHaveBeenCalledWith(
        'INSERT INTO idempotency_keys (event_id) VALUES (?)',
        ['event-3']
      );
    });

    it('should handle duplicate entry gracefully', async () => {
      mockInsertOne.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

      await expect(store.markProcessed('event-4')).resolves.not.toThrow();
    });

    it('should rethrow non-duplicate errors', async () => {
      mockInsertOne.mockRejectedValue(new Error('DB error'));

      await expect(store.markProcessed('event-5')).rejects.toThrow('DB error');
    });
  });
});
