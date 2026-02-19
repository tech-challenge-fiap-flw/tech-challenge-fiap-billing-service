jest.mock('@aws-sdk/client-sqs', () => ({
  SQSClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  SendMessageCommand: jest.fn().mockImplementation((input: any) => input),
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import { SqsPublisher } from '../messaging/SqsPublisher';

describe('SqsPublisher', () => {
  let publisher: SqsPublisher;
  let mockSend: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    publisher = new SqsPublisher('https://sqs.example.com/queue');
    mockSend = (publisher as any).client.send;
  });

  it('should publish a message to SQS', async () => {
    mockSend.mockResolvedValue({});

    await publisher.publish({
      eventType: 'TEST_EVENT',
      correlationId: 'corr-1',
      payload: { key: 'value' },
    });

    expect(mockSend).toHaveBeenCalled();
  });

  it('should include timestamp if not provided', async () => {
    mockSend.mockResolvedValue({});

    await publisher.publish({
      eventType: 'TEST_EVENT',
      correlationId: 'corr-2',
      payload: {},
    });

    expect(mockSend).toHaveBeenCalled();
  });

  it('should use provided timestamp', async () => {
    mockSend.mockResolvedValue({});

    await publisher.publish({
      eventType: 'TEST_EVENT',
      correlationId: 'corr-3',
      payload: {},
      timestamp: '2025-01-01T00:00:00.000Z',
    });

    expect(mockSend).toHaveBeenCalled();
  });

  it('should throw when SQS send fails', async () => {
    mockSend.mockRejectedValue(new Error('SQS error'));

    await expect(
      publisher.publish({
        eventType: 'TEST_EVENT',
        correlationId: 'corr-4',
        payload: {},
      })
    ).rejects.toThrow('SQS error');
  });
});
