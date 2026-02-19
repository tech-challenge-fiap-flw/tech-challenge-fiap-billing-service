import { VehicleServiceService } from '../application/VehicleServiceService';
import { VehicleServiceEntity } from '../domain/VehicleService';
import { VehicleServiceRepository } from '../domain/VehicleServiceRepository';
import { NotFoundServerException } from '../../../shared/application/ServerException';

const mockRepo: jest.Mocked<VehicleServiceRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  list: jest.fn(),
  countAll: jest.fn(),
};

describe('VehicleServiceService', () => {
  let service: VehicleServiceService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new VehicleServiceService(mockRepo);
  });

  describe('createVehicleService', () => {
    it('should create and return service', async () => {
      const input = { name: 'Oil Change', price: 150, description: null };
      const entity = VehicleServiceEntity.create(input);
      mockRepo.create.mockResolvedValue(entity);

      const result = await service.createVehicleService(input);
      expect(mockRepo.create).toHaveBeenCalled();
      expect(result.name).toBe('Oil Change');
    });
  });

  describe('updateVehicleService', () => {
    it('should update and return', async () => {
      const entity = VehicleServiceEntity.restore({ id: 1, name: 'Test', price: 100, deletedAt: null });
      mockRepo.update.mockResolvedValue(entity);

      const result = await service.updateVehicleService(1, { price: 100 });
      expect(result.id).toBe(1);
    });

    it('should throw NotFound when not found', async () => {
      mockRepo.update.mockResolvedValue(null);

      await expect(service.updateVehicleService(999, { price: 1 }))
        .rejects.toThrow(NotFoundServerException);
    });
  });

  describe('deleteVehicleService', () => {
    it('should find then soft delete', async () => {
      const entity = VehicleServiceEntity.restore({ id: 1, name: 'T', price: 10, deletedAt: null });
      mockRepo.findById.mockResolvedValue(entity);
      mockRepo.softDelete.mockResolvedValue();

      await service.deleteVehicleService(1);
      expect(mockRepo.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFound when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.deleteVehicleService(999))
        .rejects.toThrow(NotFoundServerException);
    });
  });

  describe('findById', () => {
    it('should return vehicle service', async () => {
      const entity = VehicleServiceEntity.restore({ id: 1, name: 'T', price: 10, deletedAt: null });
      mockRepo.findById.mockResolvedValue(entity);

      const result = await service.findById(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFound', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findById(999))
        .rejects.toThrow(NotFoundServerException);
    });
  });

  describe('findByIds', () => {
    it('should return found services only', async () => {
      const entity = VehicleServiceEntity.restore({ id: 1, name: 'T', price: 10, deletedAt: null });
      mockRepo.findById.mockResolvedValueOnce(entity);
      mockRepo.findById.mockResolvedValueOnce(null);

      const result = await service.findByIds([1, 2]);
      expect(result).toHaveLength(1);
    });
  });

  describe('list', () => {
    it('should return mapped items', async () => {
      const entity = VehicleServiceEntity.restore({ id: 1, name: 'T', price: 10, deletedAt: null });
      mockRepo.list.mockResolvedValue([entity]);

      const result = await service.list(0, 10);
      expect(result).toHaveLength(1);
    });
  });

  describe('countAll', () => {
    it('should return count', async () => {
      mockRepo.countAll.mockResolvedValue(5);
      expect(await service.countAll()).toBe(5);
    });
  });
});
