import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { logger } from '../../utils/logger';
import { EventMessage } from './SqsPublisher';

export type EventHandler = (message: EventMessage) => Promise<void>;

export class SqsConsumer {
  private client: SQSClient;
  private handlers: Map<string, EventHandler> = new Map();
  private running = false;

  constructor(private readonly queueUrl: string) {
    this.client = new SQSClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  on(eventType: string, handler: EventHandler): void {
    this.handlers.set(eventType, handler);
  }

  async start(): Promise<void> {
    this.running = true;
    logger.info('SQS Consumer started');
    this.poll();
  }

  stop(): void {
    this.running = false;
    logger.info('SQS Consumer stopped');
  }

  private async poll(): Promise<void> {
    while (this.running) {
      try {
        const command = new ReceiveMessageCommand({
          QueueUrl: this.queueUrl,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 20,
          MessageAttributeNames: ['All'],
        });

        const response = await this.client.send(command);

        if (response.Messages) {
          for (const msg of response.Messages) {
            try {
              const body: EventMessage = JSON.parse(msg.Body || '{}');
              const handler = this.handlers.get(body.eventType);

              if (handler) {
                await handler(body);
              } else {
                logger.warn({ eventType: body.eventType }, 'No handler for event type');
              }

              await this.client.send(new DeleteMessageCommand({
                QueueUrl: this.queueUrl,
                ReceiptHandle: msg.ReceiptHandle,
              }));
            } catch (err) {
              logger.error({ error: err, messageId: msg.MessageId }, 'Error processing SQS message');
            }
          }
        }
      } catch (err) {
        logger.error({ error: err }, 'Error polling SQS');
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }
}
