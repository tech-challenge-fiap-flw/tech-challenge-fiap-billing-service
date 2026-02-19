import { VehicleServiceEntity } from '../domain/VehicleService';

describe('VehicleServiceEntity', () => {
  describe('create', () => {
    it('should create a vehicle service with deletedAt null', () => {
      const service = VehicleServiceEntity.create({
        name: 'Oil Change',
        price: 150,
        description: 'Full oil change service',
      });

      const json = service.toJSON();
      expect(json.name).toBe('Oil Change');
      expect(json.price).toBe(150);
      expect(json.description).toBe('Full oil change service');
      expect(json.deletedAt).toBeNull();
      expect(json.id).toBeUndefined();
    });

    it('should create with null description', () => {
      const service = VehicleServiceEntity.create({
        name: 'Alignment',
        price: 80,
        description: null,
      });

      expect(service.toJSON().description).toBeNull();
    });
  });

  describe('restore', () => {
    it('should restore a vehicle service from props', () => {
      const service = VehicleServiceEntity.restore({
        id: 10,
        name: 'Balancing',
        price: 60,
        description: 'Wheel balancing',
        deletedAt: null,
      });

      const json = service.toJSON();
      expect(json.id).toBe(10);
      expect(json.name).toBe('Balancing');
    });
  });

  describe('toJSON', () => {
    it('should return a copy', () => {
      const service = VehicleServiceEntity.create({
        name: 'Test',
        price: 10,
      });

      const json1 = service.toJSON();
      const json2 = service.toJSON();
      expect(json1).toEqual(json2);
      expect(json1).not.toBe(json2);
    });
  });
});
