import { VehiclePartEntity } from '../domain/VehiclePart';

describe('VehiclePartEntity', () => {
  describe('create', () => {
    it('should create a vehicle part with default dates', () => {
      const part = VehiclePartEntity.create({
        type: 'engine',
        name: 'Oil Filter',
        description: 'High quality oil filter',
        quantity: 10,
        price: 29.99,
      });

      const json = part.toJSON();
      expect(json.type).toBe('engine');
      expect(json.name).toBe('Oil Filter');
      expect(json.description).toBe('High quality oil filter');
      expect(json.quantity).toBe(10);
      expect(json.price).toBe(29.99);
      expect(json.deletedAt).toBeNull();
      expect(json.creationDate).toBeInstanceOf(Date);
    });
  });

  describe('restore', () => {
    it('should restore a vehicle part from props', () => {
      const part = VehiclePartEntity.restore({
        id: 42,
        type: 'brake',
        name: 'Brake Pad',
        description: 'Ceramic brake pad',
        quantity: 5,
        price: 89.99,
        deletedAt: null,
        creationDate: new Date('2025-06-01'),
      });

      const json = part.toJSON();
      expect(json.id).toBe(42);
      expect(json.name).toBe('Brake Pad');
      expect(json.price).toBe(89.99);
    });
  });

  describe('toJSON', () => {
    it('should return a copy of props', () => {
      const part = VehiclePartEntity.create({
        type: 'tire',
        name: 'Tire',
        description: 'All season tire',
        quantity: 4,
        price: 199.99,
      });

      const json1 = part.toJSON();
      const json2 = part.toJSON();

      expect(json1).toEqual(json2);
      expect(json1).not.toBe(json2);
    });
  });
});
