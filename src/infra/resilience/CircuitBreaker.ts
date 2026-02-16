import { logger } from '../../utils/logger';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeoutMs?: number;
  halfOpenRequests?: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private halfOpenAttempts = 0;

  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly halfOpenRequests: number;

  constructor(private readonly name: string, options?: CircuitBreakerOptions) {
    this.failureThreshold = options?.failureThreshold ?? 5;
    this.resetTimeoutMs = options?.resetTimeoutMs ?? 30000;
    this.halfOpenRequests = options?.halfOpenRequests ?? 1;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.resetTimeoutMs) {
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenAttempts = 0;
        logger.info({ circuit: this.name }, 'Circuit breaker transitioning to HALF_OPEN');
      } else {
        throw new Error(`Circuit breaker [${this.name}] is OPEN`);
      }
    }

    if (this.state === CircuitState.HALF_OPEN && this.halfOpenAttempts >= this.halfOpenRequests) {
      throw new Error(`Circuit breaker [${this.name}] is HALF_OPEN, max attempts reached`);
    }

    try {
      if (this.state === CircuitState.HALF_OPEN) {
        this.halfOpenAttempts++;
      }
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
      logger.info({ circuit: this.name }, 'Circuit breaker CLOSED');
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      logger.warn({ circuit: this.name, failures: this.failureCount }, 'Circuit breaker OPEN');
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}
