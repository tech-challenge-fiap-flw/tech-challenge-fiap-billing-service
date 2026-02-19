import { EventTypes } from '../events/EventTypes';

describe('EventTypes', () => {
  it('should have all required event types', () => {
    expect(EventTypes.BUDGET_CREATED).toBe('BUDGET_CREATED');
    expect(EventTypes.BUDGET_APPROVED).toBe('BUDGET_APPROVED');
    expect(EventTypes.BUDGET_REJECTED).toBe('BUDGET_REJECTED');
    expect(EventTypes.PAYMENT_CONFIRMED).toBe('PAYMENT_CONFIRMED');
    expect(EventTypes.PAYMENT_FAILED).toBe('PAYMENT_FAILED');
    expect(EventTypes.OS_CREATED).toBe('OS_CREATED');
    expect(EventTypes.OS_ACCEPTED).toBe('OS_ACCEPTED');
    expect(EventTypes.OS_BUDGET_APPROVED).toBe('OS_BUDGET_APPROVED');
    expect(EventTypes.OS_BUDGET_REJECTED).toBe('OS_BUDGET_REJECTED');
  });
});
