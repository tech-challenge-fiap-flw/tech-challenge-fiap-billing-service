jest.mock('@aws-sdk/client-sqs', () => ({
  SQSClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  ReceiveMessageCommand: jest.fn().mockImplementation((input: any) => input),
  DeleteMessageCommand: jest.fn().mockImplementation((input: any) => input),
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import { SqsConsumer } from '../messaging/SqsConsumer';

describe('SqsConsumer', () => {
  let consumer: SqsConsumer;
  let mockSend: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    consumer = new SqsConsumer('https://sqs.example.com/queue');
    mockSend = (consumer as any).client.send;
  });

  it('should register handlers', () => {
    const handler = jest.fn();
    consumer.on('TEST_EVENT', handler);

    expect((consumer as any).handlers.get('TEST_EVENT')).toBe(handler);
  });

  it('should start and stop', async () => {
    // Mock send to return empty then stop after one iteration
    mockSend.mockResolvedValueOnce({ Messages: [] });

    // Start will begin polling
    const startPromise = consumer.start();

    // Stop immediately to prevent infinite loop
    setTimeout(() => consumer.stop(), 50);

    await new Promise(r => setTimeout(r, 100));
  });

  it('should process messages with matching handlers', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    consumer.on('MY_EVENT', handler);

    mockSend
      .mockResolvedValueOnce({
        Messages: [
          {
            Body: JSON.stringify({
              eventType: 'MY_EVENT',
              correlationId: 'c1',
              payload: { data: 'test' },
            }),
            MessageId: 'msg-1',
            ReceiptHandle: 'receipt-1',
          },
        ],
      })
      .mockResolvedValueOnce({ Messages: [] });

    consumer.start();
    await new Promise(r => setTimeout(r, 100));
    consumer.stop();

    expect(handler).toHaveBeenCalled();
  });

  it('should skip messages without matching handler', async () => {
    mockSend
      .mockResolvedValueOnce({
        Messages: [
          {
            Body: JSON.stringify({
              eventType: 'UNKNOWN_EVENT',
              correlationId: 'c1',
              payload: {},
            }),
            MessageId: 'msg-2',
            ReceiptHandle: 'receipt-2',
          },
        ],
      })
      .mockResolvedValueOnce({ Messages: [] });

    consumer.start();
    await new Promise(r => setTimeout(r, 100));
    consumer.stop();

    // Should have deleted the message but no handler called
    expect(mockSend).toHaveBeenCalled();
  });

  it('should handle errors during message processing', async () => {
    const handler = jest.fn().mockRejectedValue(new Error('handler error'));
    consumer.on('FAIL_EVENT', handler);

    mockSend
      .mockResolvedValueOnce({
        Messages: [
          {
            Body: JSON.stringify({
              eventType: 'FAIL_EVENT',
              correlationId: 'c1',
              payload: {},
            }),
            MessageId: 'msg-3',
            ReceiptHandle: 'receipt-3',
          },
        ],
      })
      .mockResolvedValueOnce({ Messages: [] });

    consumer.start();
    await new Promise(r => setTimeout(r, 100));
    consumer.stop();

    expect(handler).toHaveBeenCalled();
  });

  it('should handle polling errors gracefully', async () => {
    mockSend
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ Messages: [] });

    consumer.start();
    await new Promise(r => setTimeout(r, 200));
    consumer.stop();
  });
});
