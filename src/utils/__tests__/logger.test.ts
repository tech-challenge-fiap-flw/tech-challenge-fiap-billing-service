jest.mock('pino', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    fatal: jest.fn(),
  };
  return jest.fn(() => mockLogger);
});

describe('logger', () => {
  it('should export a logger instance', () => {
    const { logger } = require('../../utils/logger');

    expect(logger).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
  });

  it('should be created by pino', () => {
    const pino = require('pino');

    expect(pino).toHaveBeenCalled();
  });
});
