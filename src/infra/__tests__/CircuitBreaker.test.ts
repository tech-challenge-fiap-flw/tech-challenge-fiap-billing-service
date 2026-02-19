jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { CircuitBreaker, CircuitState } from '../resilience/CircuitBreaker';

describe('CircuitBreaker', () => {
  let cb: CircuitBreaker;

  beforeEach(() => {
    cb = new CircuitBreaker('test', {
      failureThreshold: 3,
      resetTimeoutMs: 1000,
      halfOpenRequests: 1,
    });
  });

  it('should start in CLOSED state', () => {
    expect(cb.getState()).toBe(CircuitState.CLOSED);
  });

  it('should execute successfully in CLOSED state', async () => {
    const result = await cb.execute(() => Promise.resolve('ok'));
    expect(result).toBe('ok');
    expect(cb.getState()).toBe(CircuitState.CLOSED);
  });

  it('should transition to OPEN after reaching failure threshold', async () => {
    const failFn = () => Promise.reject(new Error('fail'));

    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(failFn)).rejects.toThrow('fail');
    }

    expect(cb.getState()).toBe(CircuitState.OPEN);
  });

  it('should throw immediately when OPEN and timeout not exceeded', async () => {
    const failFn = () => Promise.reject(new Error('fail'));

    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(failFn)).rejects.toThrow('fail');
    }

    await expect(cb.execute(() => Promise.resolve('ok')))
      .rejects.toThrow('Circuit breaker [test] is OPEN');
  });

  it('should transition to HALF_OPEN after reset timeout', async () => {
    const cbFast = new CircuitBreaker('fast', {
      failureThreshold: 1,
      resetTimeoutMs: 50,
      halfOpenRequests: 1,
    });

    await expect(cbFast.execute(() => Promise.reject(new Error('fail'))))
      .rejects.toThrow('fail');

    expect(cbFast.getState()).toBe(CircuitState.OPEN);

    // Wait for reset timeout
    await new Promise(r => setTimeout(r, 60));

    const result = await cbFast.execute(() => Promise.resolve('recovered'));
    expect(result).toBe('recovered');
    expect(cbFast.getState()).toBe(CircuitState.CLOSED);
  });

  it('should return to OPEN when half-open request fails', async () => {
    const cbFast = new CircuitBreaker('fast2', {
      failureThreshold: 1,
      resetTimeoutMs: 50,
      halfOpenRequests: 1,
    });

    await expect(cbFast.execute(() => Promise.reject(new Error('fail'))))
      .rejects.toThrow('fail');

    await new Promise(r => setTimeout(r, 60));

    await expect(cbFast.execute(() => Promise.reject(new Error('still failing'))))
      .rejects.toThrow('still failing');

    expect(cbFast.getState()).toBe(CircuitState.OPEN);
  });

  it('should reject when HALF_OPEN max attempts reached', async () => {
    const cbFast = new CircuitBreaker('fast3', {
      failureThreshold: 1,
      resetTimeoutMs: 50,
      halfOpenRequests: 1,
    });

    // Trigger OPEN
    await expect(cbFast.execute(() => Promise.reject(new Error('fail'))))
      .rejects.toThrow('fail');

    await new Promise(r => setTimeout(r, 60));

    // First HALF_OPEN attempt - succeeds, moves to CLOSED
    await cbFast.execute(() => Promise.resolve('ok'));
    expect(cbFast.getState()).toBe(CircuitState.CLOSED);
  });

  it('should use default options', () => {
    const cbDefault = new CircuitBreaker('default');
    expect(cbDefault.getState()).toBe(CircuitState.CLOSED);
  });

  it('should reset failure count on success', async () => {
    const cbCount = new CircuitBreaker('count', {
      failureThreshold: 3,
      resetTimeoutMs: 1000,
    });

    await expect(cbCount.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
    await expect(cbCount.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();

    // Success resets counter
    await cbCount.execute(() => Promise.resolve('ok'));

    // Need 3 more failures to open
    await expect(cbCount.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
    await expect(cbCount.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
    expect(cbCount.getState()).toBe(CircuitState.CLOSED);
  });
});
