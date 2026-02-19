import { BudgetVehicleServiceEntity } from '../domain/BudgetVehicleServiceEntity';

describe('BudgetVehicleServiceEntity', () => {
  describe('create', () => {
    it('should create with default price 0', () => {
      const entity = BudgetVehicleServiceEntity.create({
        budgetId: 1,
        vehicleServiceId: 5,
      } as any);

      const json = entity.toJSON();
      expect(json.budgetId).toBe(1);
      expect(json.vehicleServiceId).toBe(5);
      expect(json.price).toBe(0);
    });

    it('should create with given price', () => {
      const entity = BudgetVehicleServiceEntity.create({
        budgetId: 2,
        vehicleServiceId: 10,
        price: 200,
      } as any);

      expect(entity.toJSON().price).toBe(200);
    });
  });

  describe('restore', () => {
    it('should restore from props', () => {
      const entity = BudgetVehicleServiceEntity.restore({
        id: 3,
        budgetId: 4,
        vehicleServiceId: 6,
        price: 150,
      } as any);

      const json = entity.toJSON();
      expect(json.id).toBe(3);
      expect(json.budgetId).toBe(4);
      expect(json.vehicleServiceId).toBe(6);
      expect(json.price).toBe(150);
    });
  });

  describe('toJSON', () => {
    it('should return a copy', () => {
      const entity = BudgetVehicleServiceEntity.create({
        budgetId: 1,
        vehicleServiceId: 1,
      } as any);

      const a = entity.toJSON();
      const b = entity.toJSON();
      expect(a).toEqual(b);
      expect(a).not.toBe(b);
    });
  });
});
