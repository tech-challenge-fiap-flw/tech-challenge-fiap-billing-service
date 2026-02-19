import { PaymentMySqlRepository } from '../infra/PaymentMySqlRepository';
import { PaymentEntity, PaymentStatus } from '../domain/Payment';
import * as mysql from '../../../infra/db/mysql';

jest.mock('../../../infra/db/mysql', () => ({
  query: jest.fn(),
  insertOne: jest.fn(),
  update: jest.fn(),
  deleteByField: jest.fn(),
  runInTransaction: jest.fn(),
}));

describe('PaymentMySqlRepository', () => {
  let repo: PaymentMySqlRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new PaymentMySqlRepository();
  });

  const sampleRow = {
    id: 1,
    budgetId: 10,
    externalId: 'ext-123',
    amount: 500,
    status: 'pending' as PaymentStatus,
    method: 'pix',
    payerEmail: 'test@test.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('create', () => {
    it('should insert and return entity with generated id', async () => {
      const entity = PaymentEntity.create({
        budgetId: 10,
        externalId: 'ext-123',
        amount: 500,
        status: 'pending',
        method: 'pix',
        payerEmail: 'test@test.com',
      });

      (mysql.insertOne as jest.Mock).mockResolvedValue({ insertId: 42 });

      const result = await repo.create(entity);

      expect(mysql.insertOne).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO payments'),
        expect.arrayContaining([10, 'ext-123', 500, 'pending', 'pix', 'test@test.com']),
      );
      expect(result.toJSON().id).toBe(42);
    });
  });

  describe('findById', () => {
    it('should return entity when found', async () => {
      (mysql.query as jest.Mock).mockResolvedValue([sampleRow]);

      const result = await repo.findById(1);

      expect(result).not.toBeNull();
      expect(result!.toJSON().externalId).toBe('ext-123');
    });

    it('should return null when not found', async () => {
      (mysql.query as jest.Mock).mockResolvedValue([]);

      const result = await repo.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByBudgetId', () => {
    it('should return entity when found', async () => {
      (mysql.query as jest.Mock).mockResolvedValue([sampleRow]);

      const result = await repo.findByBudgetId(10);

      expect(result).not.toBeNull();
      expect(mysql.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE budgetId = ?'),
        [10],
      );
    });

    it('should return null when not found', async () => {
      (mysql.query as jest.Mock).mockResolvedValue([]);

      const result = await repo.findByBudgetId(999);

      expect(result).toBeNull();
    });
  });

  describe('findByExternalId', () => {
    it('should return entity when found', async () => {
      (mysql.query as jest.Mock).mockResolvedValue([sampleRow]);

      const result = await repo.findByExternalId('ext-123');

      expect(result).not.toBeNull();
      expect(mysql.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE externalId = ?'),
        ['ext-123'],
      );
    });

    it('should return null when not found', async () => {
      (mysql.query as jest.Mock).mockResolvedValue([]);

      const result = await repo.findByExternalId('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update status and return updated entity', async () => {
      const updatedRow = { ...sampleRow, status: 'approved' };
      (mysql.update as jest.Mock).mockResolvedValue({});
      (mysql.query as jest.Mock).mockResolvedValue([updatedRow]);

      const result = await repo.updateStatus(1, 'approved');

      expect(mysql.update).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE payments SET status = ?'),
        expect.arrayContaining(['approved', 1]),
      );
      expect(result).not.toBeNull();
      expect(result!.toJSON().status).toBe('approved');
    });

    it('should return null when entity not found after update', async () => {
      (mysql.update as jest.Mock).mockResolvedValue({});
      (mysql.query as jest.Mock).mockResolvedValue([]);

      const result = await repo.updateStatus(999, 'approved');

      expect(result).toBeNull();
    });
  });
});
