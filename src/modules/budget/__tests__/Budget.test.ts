import { BudgetEntity, BudgetProps } from '../domain/Budget';
import { RowDataPacket } from 'mysql2';

describe('BudgetEntity', () => {
  describe('create', () => {
    it('should create a budget with default values', () => {
      const budget = BudgetEntity.create({
        description: 'Test budget',
        ownerId: 1,
        diagnosisId: 10,
      });

      const json = budget.toJSON();
      expect(json.id).toBe(0);
      expect(json.description).toBe('Test budget');
      expect(json.ownerId).toBe(1);
      expect(json.diagnosisId).toBe(10);
      expect(json.total).toBe(0);
      expect(json.deletedAt).toBeNull();
      expect(json.creationDate).toBeInstanceOf(Date);
    });

    it('should create a budget with a custom total', () => {
      const budget = BudgetEntity.create({
        description: 'Budget with total',
        ownerId: 2,
        diagnosisId: 20,
        total: 500,
      });

      expect(budget.toJSON().total).toBe(500);
    });
  });

  describe('restore', () => {
    it('should restore a budget from props', () => {
      const props: BudgetProps = {
        id: 5,
        description: 'Restored budget',
        ownerId: 3,
        diagnosisId: 30,
        total: 1000,
        creationDate: new Date('2025-01-01'),
        deletedAt: null,
      } as BudgetProps;

      const budget = BudgetEntity.restore(props);
      const json = budget.toJSON();

      expect(json.id).toBe(5);
      expect(json.description).toBe('Restored budget');
      expect(json.total).toBe(1000);
    });
  });

  describe('toJSON', () => {
    it('should return a shallow copy of props', () => {
      const budget = BudgetEntity.create({
        description: 'JSON test',
        ownerId: 1,
        diagnosisId: 1,
      });

      const json1 = budget.toJSON();
      const json2 = budget.toJSON();

      expect(json1).toEqual(json2);
      expect(json1).not.toBe(json2);
    });
  });
});
