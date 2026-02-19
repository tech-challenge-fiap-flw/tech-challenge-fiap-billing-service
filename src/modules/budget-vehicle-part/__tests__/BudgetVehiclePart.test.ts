import { BudgetVehiclePartEntity } from '../domain/BudgetVehiclePart';

describe('BudgetVehiclePartEntity', () => {
  describe('create', () => {
    it('should create with id 0', () => {
      const entity = BudgetVehiclePartEntity.create({
        budgetId: 1,
        vehiclePartId: 10,
        quantity: 3,
      });

      const json = entity.toJSON();
      expect(json.id).toBe(0);
      expect(json.budgetId).toBe(1);
      expect(json.vehiclePartId).toBe(10);
      expect(json.quantity).toBe(3);
    });
  });

  describe('restore', () => {
    it('should restore from props', () => {
      const entity = BudgetVehiclePartEntity.restore({
        id: 5,
        budgetId: 2,
        vehiclePartId: 20,
        quantity: 7,
      });

      const json = entity.toJSON();
      expect(json.id).toBe(5);
      expect(json.budgetId).toBe(2);
      expect(json.vehiclePartId).toBe(20);
      expect(json.quantity).toBe(7);
    });
  });

  describe('toJSON', () => {
    it('should return a copy', () => {
      const entity = BudgetVehiclePartEntity.create({
        budgetId: 1,
        vehiclePartId: 1,
        quantity: 1,
      });

      const a = entity.toJSON();
      const b = entity.toJSON();
      expect(a).toEqual(b);
      expect(a).not.toBe(b);
    });
  });
});
