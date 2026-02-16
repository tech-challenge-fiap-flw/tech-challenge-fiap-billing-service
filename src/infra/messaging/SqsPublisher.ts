import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { logger } from '../../utils/logger';

export interface EventMessage {
  eventType: string;
  correlationId: string;
  payload: Record<string, unknown>;
  timestamp?: string;
}

export class SqsPublisher {
  private client: SQSClient;

  constructor(private readonly queueUrl: string) {
    this.client = new SQSClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  async publish(message: EventMessage): Promise<void> {
    const body: EventMessage = {
      ...message,
      timestamp: message.timestamp || new Date().toISOString(),
    };

    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(body),
      MessageAttributes: {
        eventType: {
          DataType: 'String',
          StringValue: message.eventType,
        },
      },
    });

    try {
      await this.client.send(command);
      logger.info({ eventType: message.eventType, correlationId: message.correlationId }, 'Event published to SQS');
    } catch (error) {
      logger.error({ error, eventType: message.eventType }, 'Failed to publish event to SQS');
      throw error;
    }
  }
}
