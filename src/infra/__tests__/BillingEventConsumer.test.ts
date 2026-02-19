jest.mock('../messaging/SqsConsumer', () => {
  return {
    SqsConsumer: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    })),
  };
});

jest.mock('../messaging/IdempotencyStore', () => {
  return {
    IdempotencyStore: jest.fn().mockImplementation(() => ({
      isProcessed: jest.fn(),
      markProcessed: jest.fn(),
    })),
  };
});

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import { BillingEventConsumer } from '../messaging/BillingEventConsumer';
import { SqsConsumer } from '../messaging/SqsConsumer';
import { IdempotencyStore } from '../messaging/IdempotencyStore';
import { EventTypes } from '../../shared/events/EventTypes';

describe('BillingEventConsumer', () => {
  let billingConsumer: BillingEventConsumer;
  let mockConsunerOn: jest.Mock;
  let mockIdempotencyIsProcessed: jest.Mock;
  let mockIdempotencyMarkProcessed: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    billingConsumer = new BillingEventConsumer('https://sqs.example.com/queue');
    mockConsunerOn = (billingConsumer as any).consumer.on;
    mockIdempotencyIsProcessed = (billingConsumer as any).idempotencyStore.isProcessed;
    mockIdempotencyMarkProcessed = (billingConsumer as any).idempotencyStore.markProcessed;
  });

  it('should register handlers for all expected event types', () => {
    expect(mockConsunerOn).toHaveBeenCalledWith(EventTypes.OS_BUDGET_APPROVED, expect.any(Function));
    expect(mockConsunerOn).toHaveBeenCalledWith(EventTypes.OS_BUDGET_REJECTED, expect.any(Function));
    expect(mockConsunerOn).toHaveBeenCalledWith(EventTypes.OS_CREATED, expect.any(Function));
  });

  it('should start the consumer', () => {
    billingConsumer.start();
    expect((billingConsumer as any).consumer.start).toHaveBeenCalled();
  });

  it('should stop the consumer', () => {
    billingConsumer.stop();
    expect((billingConsumer as any).consumer.stop).toHaveBeenCalled();
  });

  it('should process OS_BUDGET_APPROVED event', async () => {
    const handler = mockConsunerOn.mock.calls.find(
      (call: any[]) => call[0] === EventTypes.OS_BUDGET_APPROVED
    )?.[1];

    mockIdempotencyIsProcessed.mockResolvedValue(false);
    mockIdempotencyMarkProcessed.mockResolvedValue(undefined);

    await handler({
      eventType: EventTypes.OS_BUDGET_APPROVED,
      correlationId: 'corr-1',
      timestamp: '2025-01-01',
      payload: { budgetId: 1 },
    });

    expect(mockIdempotencyIsProcessed).toHaveBeenCalled();
    expect(mockIdempotencyMarkProcessed).toHaveBeenCalled();
  });

  it('should skip already processed OS_BUDGET_APPROVED event', async () => {
    const handler = mockConsunerOn.mock.calls.find(
      (call: any[]) => call[0] === EventTypes.OS_BUDGET_APPROVED
    )?.[1];

    mockIdempotencyIsProcessed.mockResolvedValue(true);

    await handler({
      eventType: EventTypes.OS_BUDGET_APPROVED,
      correlationId: 'corr-1',
      timestamp: '2025-01-01',
      payload: { budgetId: 1 },
    });

    expect(mockIdempotencyMarkProcessed).not.toHaveBeenCalled();
  });

  it('should process OS_BUDGET_REJECTED event', async () => {
    const handler = mockConsunerOn.mock.calls.find(
      (call: any[]) => call[0] === EventTypes.OS_BUDGET_REJECTED
    )?.[1];

    mockIdempotencyIsProcessed.mockResolvedValue(false);
    mockIdempotencyMarkProcessed.mockResolvedValue(undefined);

    await handler({
      eventType: EventTypes.OS_BUDGET_REJECTED,
      correlationId: 'corr-2',
      timestamp: '2025-01-01',
      payload: { budgetId: 2 },
    });

    expect(mockIdempotencyMarkProcessed).toHaveBeenCalled();
  });

  it('should skip already processed OS_BUDGET_REJECTED event', async () => {
    const handler = mockConsunerOn.mock.calls.find(
      (call: any[]) => call[0] === EventTypes.OS_BUDGET_REJECTED
    )?.[1];

    mockIdempotencyIsProcessed.mockResolvedValue(true);

    await handler({
      eventType: EventTypes.OS_BUDGET_REJECTED,
      correlationId: 'corr-2',
      timestamp: '2025-01-01',
      payload: {},
    });

    expect(mockIdempotencyMarkProcessed).not.toHaveBeenCalled();
  });

  it('should process OS_CREATED event', async () => {
    const handler = mockConsunerOn.mock.calls.find(
      (call: any[]) => call[0] === EventTypes.OS_CREATED
    )?.[1];

    mockIdempotencyIsProcessed.mockResolvedValue(false);
    mockIdempotencyMarkProcessed.mockResolvedValue(undefined);

    await handler({
      eventType: EventTypes.OS_CREATED,
      correlationId: 'corr-3',
      timestamp: '2025-01-01',
      payload: {},
    });

    expect(mockIdempotencyMarkProcessed).toHaveBeenCalled();
  });

  it('should skip already processed OS_CREATED event', async () => {
    const handler = mockConsunerOn.mock.calls.find(
      (call: any[]) => call[0] === EventTypes.OS_CREATED
    )?.[1];

    mockIdempotencyIsProcessed.mockResolvedValue(true);

    await handler({
      eventType: EventTypes.OS_CREATED,
      correlationId: 'corr-3',
      timestamp: '2025-01-01',
      payload: {},
    });

    expect(mockIdempotencyMarkProcessed).not.toHaveBeenCalled();
  });
});
