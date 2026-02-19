import { BudgetVehiclePartService } from '../application/BudgetVehiclePartService';
import { BudgetVehiclePartEntity } from '../domain/BudgetVehiclePart';
import { IBudgetVehiclePartRepository } from '../domain/IBudgetVehiclePartRepository';

const mockRepo: jest.Mocked<IBudgetVehiclePartRepository> = {
  create: jest.fn(),
  bulkCreate: jest.fn(),
  listByBudget: jest.fn(),
  updateQuantity: jest.fn(),
  deleteByIds: jest.fn(),
};

describe('BudgetVehiclePartService', () => {
  let service: BudgetVehiclePartService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BudgetVehiclePartService(mockRepo);
  });

  describe('createMany', () => {
    it('should create entities and return outputs', async () => {
      const entities = [
        BudgetVehiclePartEntity.restore({ id: 1, budgetId: 10, vehiclePartId: 100, quantity: 2 }),
        BudgetVehiclePartEntity.restore({ id: 2, budgetId: 10, vehiclePartId: 200, quantity: 3 }),
      ];
      mockRepo.bulkCreate.mockResolvedValue(entities);

      const result = await service.createMany({
        budgetId: 10,
        parts: [
          { vehiclePartId: 100, quantity: 2 },
          { vehiclePartId: 200, quantity: 3 },
        ],
      });

      expect(mockRepo.bulkCreate).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].budgetId).toBe(10);
    });
  });

  describe('listByBudget', () => {
    it('should return mapped items', async () => {
      const entities = [
        BudgetVehiclePartEntity.restore({ id: 1, budgetId: 10, vehiclePartId: 100, quantity: 2 }),
      ];
      mockRepo.listByBudget.mockResolvedValue(entities);

      const result = await service.listByBudget(10);
      expect(result).toHaveLength(1);
      expect(result[0].vehiclePartId).toBe(100);
    });
  });

  describe('updateMany', () => {
    it('should call updateQuantity for each item', async () => {
      mockRepo.updateQuantity.mockResolvedValue();

      await service.updateMany([
        { id: 1, quantity: 5, vehiclePartId: 100 },
        { id: 2, quantity: 10, vehiclePartId: 200 },
      ]);

      expect(mockRepo.updateQuantity).toHaveBeenCalledTimes(2);
      expect(mockRepo.updateQuantity).toHaveBeenCalledWith(1, 5);
      expect(mockRepo.updateQuantity).toHaveBeenCalledWith(2, 10);
    });
  });

  describe('removeMany', () => {
    it('should call deleteByIds', async () => {
      mockRepo.deleteByIds.mockResolvedValue();

      await service.removeMany({ ids: [1, 2, 3] });

      expect(mockRepo.deleteByIds).toHaveBeenCalledWith([1, 2, 3]);
    });
  });
});
