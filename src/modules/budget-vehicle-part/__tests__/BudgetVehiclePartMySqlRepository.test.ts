import { BudgetVehiclePartMySqlRepository } from '../infra/BudgetVehiclePartMySqlRepository';
import { BudgetVehiclePartEntity } from '../domain/BudgetVehiclePart';
import * as mysql from '../../../infra/db/mysql';

jest.mock('../../../infra/db/mysql', () => ({
  query: jest.fn(),
  insertOne: jest.fn(),
  update: jest.fn(),
  deleteByField: jest.fn(),
  runInTransaction: jest.fn(),
}));

describe('BudgetVehiclePartMySqlRepository', () => {
  let repo: BudgetVehiclePartMySqlRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new BudgetVehiclePartMySqlRepository();
  });

  describe('create', () => {
    it('should insert and return entity with generated id', async () => {
      const entity = BudgetVehiclePartEntity.create({
        budgetId: 1,
        vehiclePartId: 10,
        quantity: 3,
      });

      (mysql.insertOne as jest.Mock).mockResolvedValue({ insertId: 99 });

      const result = await repo.create(entity);

      expect(mysql.insertOne).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO budget_vehicle_parts'),
        [1, 10, 3],
      );
      expect(result.toJSON().id).toBe(99);
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple entities', async () => {
      const e1 = BudgetVehiclePartEntity.create({ budgetId: 1, vehiclePartId: 10, quantity: 2 });
      const e2 = BudgetVehiclePartEntity.create({ budgetId: 1, vehiclePartId: 11, quantity: 5 });

      (mysql.insertOne as jest.Mock)
        .mockResolvedValueOnce({ insertId: 1 })
        .mockResolvedValueOnce({ insertId: 2 });

      const result = await repo.bulkCreate([e1, e2]);

      expect(result).toHaveLength(2);
      expect(mysql.insertOne).toHaveBeenCalledTimes(2);
    });

    it('should return empty array for empty input', async () => {
      const result = await repo.bulkCreate([]);

      expect(result).toHaveLength(0);
    });
  });

  describe('listByBudget', () => {
    it('should return entities for a budget', async () => {
      const rows = [
        { id: 1, budgetId: 5, vehiclePartId: 10, quantity: 2 },
        { id: 2, budgetId: 5, vehiclePartId: 11, quantity: 3 },
      ];
      (mysql.query as jest.Mock).mockResolvedValue(rows);

      const result = await repo.listByBudget(5);

      expect(result).toHaveLength(2);
      expect(mysql.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM budget_vehicle_parts WHERE budgetId = ?'),
        [5],
      );
    });

    it('should return empty array when none found', async () => {
      (mysql.query as jest.Mock).mockResolvedValue([]);

      const result = await repo.listByBudget(999);

      expect(result).toHaveLength(0);
    });
  });

  describe('updateQuantity', () => {
    it('should update quantity for given id', async () => {
      (mysql.update as jest.Mock).mockResolvedValue({});

      await repo.updateQuantity(1, 10);

      expect(mysql.update).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE budget_vehicle_parts SET quantity = ?'),
        [10, 1],
      );
    });
  });

  describe('deleteByIds', () => {
    it('should delete by ids', async () => {
      (mysql.update as jest.Mock).mockResolvedValue({});

      await repo.deleteByIds([1, 2, 3]);

      expect(mysql.update).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM budget_vehicle_parts WHERE id IN'),
        [1, 2, 3],
      );
    });

    it('should not execute when ids array is empty', async () => {
      await repo.deleteByIds([]);

      expect(mysql.update).not.toHaveBeenCalled();
    });
  });
});
