import { BudgetVehicleServiceService } from '../application/BudgetVehicleServiceService';
import { BudgetVehicleServiceEntity } from '../domain/BudgetVehicleServiceEntity';
import { IBudgetVehicleServiceMySqlRepository } from '../domain/IBudgetVehicleServiceMySqlRepository';
import { NotFoundServerException } from '../../../shared/application/ServerException';

const mockRepo: jest.Mocked<IBudgetVehicleServiceMySqlRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('BudgetVehicleServiceService', () => {
  let service: BudgetVehicleServiceService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BudgetVehicleServiceService(mockRepo);
  });

  describe('create', () => {
    it('should create and return output', async () => {
      const entity = BudgetVehicleServiceEntity.restore({
        id: 1, budgetId: 10, vehicleServiceId: 5, price: 200,
      } as any);
      mockRepo.create.mockResolvedValue(entity);

      const result = await service.create({ budgetId: 10, vehicleServiceId: 5, price: 200 });

      expect(mockRepo.create).toHaveBeenCalled();
      expect(result.budgetId).toBe(10);
    });
  });

  describe('createMany', () => {
    it('should create entries for each service id', async () => {
      const entity = BudgetVehicleServiceEntity.restore({
        id: 1, budgetId: 10, vehicleServiceId: 5, price: 0,
      } as any);
      mockRepo.create.mockResolvedValue(entity);

      const result = await service.createMany({
        budgetId: 10,
        vehicleServiceIds: [5, 6],
      });

      expect(mockRepo.create).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('should find, then update, then return', async () => {
      const entity = BudgetVehicleServiceEntity.restore({
        id: 1, budgetId: 10, vehicleServiceId: 5, price: 300,
      } as any);
      mockRepo.findById.mockResolvedValue(entity);
      mockRepo.update.mockResolvedValue(entity);

      const result = await service.update(1, { price: 300 });
      expect(result.price).toBe(300);
    });

    it('should throw NotFound when item not found on find', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.update(999, { price: 1 }))
        .rejects.toThrow(NotFoundServerException);
    });

    it('should throw NotFound when update returns null', async () => {
      const entity = BudgetVehicleServiceEntity.restore({
        id: 1, budgetId: 10, vehicleServiceId: 5, price: 100,
      } as any);
      mockRepo.findById.mockResolvedValue(entity);
      mockRepo.update.mockResolvedValue(null);

      await expect(service.update(1, { price: 200 }))
        .rejects.toThrow(NotFoundServerException);
    });
  });

  describe('delete', () => {
    it('should find then delete', async () => {
      const entity = BudgetVehicleServiceEntity.restore({
        id: 1, budgetId: 10, vehicleServiceId: 5,
      } as any);
      mockRepo.findById.mockResolvedValue(entity);
      mockRepo.delete.mockResolvedValue();

      await service.delete(1);
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFound when item not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.delete(999))
        .rejects.toThrow(NotFoundServerException);
    });
  });

  describe('findById', () => {
    it('should return the item', async () => {
      const entity = BudgetVehicleServiceEntity.restore({
        id: 1, budgetId: 10, vehicleServiceId: 5,
      } as any);
      mockRepo.findById.mockResolvedValue(entity);

      const result = await service.findById(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFound when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findById(999))
        .rejects.toThrow(NotFoundServerException);
    });
  });
});
