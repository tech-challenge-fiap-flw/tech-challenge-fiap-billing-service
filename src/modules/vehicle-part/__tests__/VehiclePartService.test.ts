import { VehiclePartService } from '../application/VehiclePartService';
import { VehiclePartEntity } from '../domain/VehiclePart';
import { VehiclePartRepository } from '../domain/VehiclePartRepository';
import { NotFoundServerException } from '../../../shared/application/ServerException';

const mockRepo: jest.Mocked<VehiclePartRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  list: jest.fn(),
  countAll: jest.fn(),
  transaction: jest.fn(),
};

describe('VehiclePartService', () => {
  let service: VehiclePartService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new VehiclePartService(mockRepo);
  });

  describe('createVehiclePart', () => {
    it('should create and return a vehicle part', async () => {
      const input = { type: 'engine', name: 'Filter', description: 'Oil filter', quantity: 10, price: 30 };
      const entity = VehiclePartEntity.create(input);
      mockRepo.create.mockResolvedValue(entity);

      const result = await service.createVehiclePart(input);

      expect(mockRepo.create).toHaveBeenCalled();
      expect(result.name).toBe('Filter');
    });
  });

  describe('updateVehiclePart', () => {
    it('should update and return the part', async () => {
      const entity = VehiclePartEntity.restore({ id: 1, type: 'brake', name: 'Pad', description: 'Desc', quantity: 5, price: 50 });
      mockRepo.update.mockResolvedValue(entity);

      const result = await service.updateVehiclePart(1, { quantity: 5 });

      expect(mockRepo.update).toHaveBeenCalledWith(1, { quantity: 5 });
      expect(result.id).toBe(1);
    });

    it('should throw NotFound when part not found', async () => {
      mockRepo.update.mockResolvedValue(null);

      await expect(service.updateVehiclePart(999, { quantity: 1 }))
        .rejects.toThrow(NotFoundServerException);
    });
  });

  describe('deleteVehiclePart', () => {
    it('should find then soft delete', async () => {
      const entity = VehiclePartEntity.restore({ id: 1, type: 'x', name: 'x', description: 'x', quantity: 1, price: 1 });
      mockRepo.findById.mockResolvedValue(entity);
      mockRepo.softDelete.mockResolvedValue();

      await service.deleteVehiclePart(1);

      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFound when part does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.deleteVehiclePart(999))
        .rejects.toThrow(NotFoundServerException);
    });
  });

  describe('findById', () => {
    it('should return the part', async () => {
      const entity = VehiclePartEntity.restore({ id: 1, type: 'x', name: 'x', description: 'x', quantity: 1, price: 1 });
      mockRepo.findById.mockResolvedValue(entity);

      const result = await service.findById(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFound when not exists', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findById(999))
        .rejects.toThrow(NotFoundServerException);
    });
  });

  describe('findByIds', () => {
    it('should return found parts', async () => {
      const entity = VehiclePartEntity.restore({ id: 1, type: 'x', name: 'x', description: 'x', quantity: 1, price: 1 });
      mockRepo.findById.mockResolvedValueOnce(entity);
      mockRepo.findById.mockResolvedValueOnce(null);

      const result = await service.findByIds([1, 2]);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('should return empty array when no ids', async () => {
      const result = await service.findByIds([]);
      expect(result).toEqual([]);
    });
  });

  describe('list', () => {
    it('should return mapped items', async () => {
      const entity = VehiclePartEntity.restore({ id: 1, type: 'x', name: 'x', description: 'x', quantity: 1, price: 1 });
      mockRepo.list.mockResolvedValue([entity]);

      const result = await service.list(0, 10);
      expect(result).toHaveLength(1);
    });
  });

  describe('countAll', () => {
    it('should delegate to repo', async () => {
      mockRepo.countAll.mockResolvedValue(42);

      const result = await service.countAll();
      expect(result).toBe(42);
    });
  });
});
