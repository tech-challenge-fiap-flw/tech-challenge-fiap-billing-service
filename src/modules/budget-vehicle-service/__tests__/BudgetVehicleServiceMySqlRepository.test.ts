import { BudgetVehicleServiceMySqlRepository } from '../infra/BudgetVehicleServiceMySqlRepository';
import { BudgetVehicleServiceEntity, IBudgetVehicleServiceProps } from '../domain/BudgetVehicleServiceEntity';
import * as mysql from '../../../infra/db/mysql';

jest.mock('../../../infra/db/mysql', () => ({
  query: jest.fn(),
  insertOne: jest.fn(),
  update: jest.fn(),
  deleteByField: jest.fn(),
  runInTransaction: jest.fn(),
}));

describe('BudgetVehicleServiceMySqlRepository', () => {
  let repo: BudgetVehicleServiceMySqlRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new BudgetVehicleServiceMySqlRepository();
  });

  describe('create', () => {
    it('should insert and return entity with generated id', async () => {
      const entity = BudgetVehicleServiceEntity.create({
        budgetId: 1,
        vehicleServiceId: 10,
        price: 250,
      } as IBudgetVehicleServiceProps);

      (mysql.insertOne as jest.Mock).mockResolvedValue({ insertId: 77 });

      const result = await repo.create(entity);

      expect(mysql.insertOne).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO budget_vehicle_services'),
        [1, 10, 250],
      );
      expect(result.toJSON().id).toBe(77);
    });
  });

  describe('findById', () => {
    it('should return entity when found', async () => {
      const row = { id: 1, budgetId: 5, vehicleServiceId: 10, price: 200 };
      (mysql.query as jest.Mock).mockResolvedValue([row]);

      const result = await repo.findById(1);

      expect(result).not.toBeNull();
      expect(result!.toJSON().price).toBe(200);
    });

    it('should return null when not found', async () => {
      (mysql.query as jest.Mock).mockResolvedValue([]);

      const result = await repo.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return entity', async () => {
      (mysql.update as jest.Mock).mockResolvedValue({});
      (mysql.query as jest.Mock).mockResolvedValue([{ id: 1, budgetId: 5, vehicleServiceId: 10, price: 300 }]);

      const result = await repo.update(1, { price: 300 } as Partial<IBudgetVehicleServiceProps>);

      expect(mysql.update).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE budget_vehicle_services SET'),
        expect.arrayContaining([300, 1]),
      );
      expect(result).not.toBeNull();
      expect(result!.toJSON().price).toBe(300);
    });

    it('should return null when entity not found after update', async () => {
      (mysql.update as jest.Mock).mockResolvedValue({});
      (mysql.query as jest.Mock).mockResolvedValue([]);

      const result = await repo.update(999, { price: 100 } as Partial<IBudgetVehicleServiceProps>);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete by id', async () => {
      (mysql.deleteByField as jest.Mock).mockResolvedValue(undefined);

      await repo.delete(1);

      expect(mysql.deleteByField).toHaveBeenCalledWith('budget_vehicle_services', 'id', 1);
    });
  });
});
