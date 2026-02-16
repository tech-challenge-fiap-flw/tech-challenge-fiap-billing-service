import { SqsConsumer } from './SqsConsumer';
import { IdempotencyStore } from './IdempotencyStore';
import { EventTypes } from '../../shared/events/EventTypes';
import { logger } from '../../utils/logger';

export class BillingEventConsumer {
  private consumer: SqsConsumer;
  private idempotencyStore: IdempotencyStore;

  constructor(queueUrl: string) {
    this.consumer = new SqsConsumer(queueUrl);
    this.idempotencyStore = new IdempotencyStore();
    this.registerHandlers();
  }

  private registerHandlers(): void {
    this.consumer.on(EventTypes.OS_BUDGET_APPROVED, async (message) => {
      const eventId = `${message.eventType}-${message.correlationId}-${message.timestamp}`;
      if (await this.idempotencyStore.isProcessed(eventId)) {
        logger.info({ eventId }, 'Event already processed, skipping');
        return;
      }

      logger.info({ payload: message.payload }, 'Budget approved by customer - ready for payment');
      await this.idempotencyStore.markProcessed(eventId);
    });

    this.consumer.on(EventTypes.OS_BUDGET_REJECTED, async (message) => {
      const eventId = `${message.eventType}-${message.correlationId}-${message.timestamp}`;
      if (await this.idempotencyStore.isProcessed(eventId)) {
        logger.info({ eventId }, 'Event already processed, skipping');
        return;
      }

      logger.info({ payload: message.payload }, 'Budget rejected by customer - rolling back stock');
      await this.idempotencyStore.markProcessed(eventId);
    });

    this.consumer.on(EventTypes.OS_CREATED, async (message) => {
      const eventId = `${message.eventType}-${message.correlationId}-${message.timestamp}`;
      if (await this.idempotencyStore.isProcessed(eventId)) {
        return;
      }

      logger.info({ payload: message.payload }, 'New OS created - Billing notified');
      await this.idempotencyStore.markProcessed(eventId);
    });
  }

  start(): void {
    this.consumer.start();
  }

  stop(): void {
    this.consumer.stop();
  }
}
