import { BudgetMySqlRepository } from '../infra/BudgetMySqlRepository';
import { BudgetEntity } from '../domain/Budget';
import * as mysql from '../../../infra/db/mysql';

jest.mock('../../../infra/db/mysql', () => ({
  query: jest.fn(),
  insertOne: jest.fn(),
  update: jest.fn(),
  deleteByField: jest.fn(),
  runInTransaction: jest.fn(),
}));

describe('BudgetMySqlRepository', () => {
  let repo: BudgetMySqlRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new BudgetMySqlRepository();
  });

  describe('create', () => {
    it('should insert a budget and return entity with generated id', async () => {
      const entity = BudgetEntity.create({
        description: 'Test Budget',
        ownerId: 1,
        diagnosisId: 10,
        total: 500,
      });

      (mysql.insertOne as jest.Mock).mockResolvedValue({ insertId: 42 });

      const result = await repo.create(entity);

      expect(mysql.insertOne).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO budgets'),
        expect.arrayContaining(['Test Budget', 1, 10, 500]),
      );
      expect(result.toJSON().id).toBe(42);
      expect(result.toJSON().description).toBe('Test Budget');
    });

    it('should pass deletedAt as null when not set', async () => {
      const entity = BudgetEntity.create({
        description: 'No delete',
        ownerId: 2,
        diagnosisId: 5,
        total: 100,
      });

      (mysql.insertOne as jest.Mock).mockResolvedValue({ insertId: 10 });

      await repo.create(entity);

      const params = (mysql.insertOne as jest.Mock).mock.calls[0][1];
      expect(params[params.length - 1]).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return entity when found', async () => {
      const row = {
        id: 1,
        description: 'Found Budget',
        ownerId: 1,
        diagnosisId: 5,
        total: 200,
        creationDate: new Date(),
        deletedAt: null,
      };
      (mysql.query as jest.Mock).mockResolvedValue([row]);

      const result = await repo.findById(1);

      expect(result).not.toBeNull();
      expect(result!.toJSON().description).toBe('Found Budget');
      expect(mysql.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM budgets WHERE id = ?'),
        [1],
      );
    });

    it('should return null when not found', async () => {
      (mysql.query as jest.Mock).mockResolvedValue([]);

      const result = await repo.findById(999);

      expect(result).toBeNull();
    });

    it('should filter by userId when provided', async () => {
      (mysql.query as jest.Mock).mockResolvedValue([]);

      await repo.findById(1, 42);

      expect(mysql.query).toHaveBeenCalledWith(
        expect.stringContaining('AND ownerId = ?'),
        [1, 42],
      );
    });

    it('should not filter by userId when not provided', async () => {
      (mysql.query as jest.Mock).mockResolvedValue([]);

      await repo.findById(1);

      const sql = (mysql.query as jest.Mock).mock.calls[0][0];
      expect(sql).not.toContain('ownerId');
    });
  });

  describe('transaction (inherited from BaseRepository)', () => {
    it('should delegate to mysql.runInTransaction', async () => {
      const fn = jest.fn().mockResolvedValue('result');
      (mysql.runInTransaction as jest.Mock).mockImplementation((cb: any) => cb());

      await repo.transaction(fn);

      expect(mysql.runInTransaction).toHaveBeenCalledWith(fn);
    });
  });
});
