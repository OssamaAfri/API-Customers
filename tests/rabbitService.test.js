const amqp = require('amqplib');
const {
  connectRabbitMQ,
  publishMessage,
  closeRabbitMQ,
  __setChannel,
  __setConnection
} = require('../src/services/rabbitService');

// Sauvegarder la valeur originale de SKIP_RABBITMQ
const originalSkip = process.env.SKIP_RABBITMQ;

jest.mock('amqplib');

describe('rabbitService - connectRabbitMQ try/catch coverage', () => {
  beforeAll(() => {
    process.env.SKIP_RABBITMQ = 'false';
  });
  afterAll(() => {
    process.env.SKIP_RABBITMQ = originalSkip;
  });
  afterEach(() => {
    jest.clearAllMocks();
    __setChannel(undefined);
    __setConnection(undefined);
  });

  it('executes the try block when connection succeeds', async () => {
    process.env.NODE_ENV = 'development';
    const fakeChannel = { close: jest.fn() };
    const fakeConnection = { createChannel: jest.fn().mockResolvedValue(fakeChannel) };
    amqp.connect.mockResolvedValue(fakeConnection);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await connectRabbitMQ();
    expect(amqp.connect).toHaveBeenCalledWith(process.env.RABBITMQ_URI);
    expect(fakeConnection.createChannel).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith('RabbitMQ connected');
    logSpy.mockRestore();
  });

  it('executes the catch block when connection fails', async () => {
    process.env.NODE_ENV = 'development';
    const fakeError = new Error('Failed to connect');
    amqp.connect.mockRejectedValue(fakeError);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await connectRabbitMQ();
    expect(errorSpy).toHaveBeenCalledWith('RabbitMQ connection error', fakeError);
    errorSpy.mockRestore();
  });
});

describe('rabbitService - publishMessage and closeRabbitMQ', () => {
  afterEach(() => {
    jest.clearAllMocks();
    __setChannel(undefined);
    __setConnection(undefined);
  });

  describe('publishMessage', () => {
    it('should do nothing if channel is undefined', async () => {
      __setChannel(undefined);
      await expect(publishMessage('testExchange', { test: true })).resolves.toBeUndefined();
    });

    it('should publish message if channel is defined', async () => {
      const fakeChannel = {
        assertExchange: jest.fn().mockResolvedValue(),
        publish: jest.fn()
      };
      __setChannel(fakeChannel);
      const msg = { test: true };
      await publishMessage('testExchange', msg);
      expect(fakeChannel.assertExchange).toHaveBeenCalledWith('testExchange', 'fanout', { durable: true });
      expect(fakeChannel.publish).toHaveBeenCalledWith('testExchange', '', Buffer.from(JSON.stringify(msg)));
    });
  });

  describe('closeRabbitMQ', () => {
    it('should close channel and connection if defined', async () => {
      const fakeChannel = { close: jest.fn().mockResolvedValue() };
      const fakeConnection = { close: jest.fn().mockResolvedValue() };
      __setChannel(fakeChannel);
      __setConnection(fakeConnection);
      await closeRabbitMQ();
      expect(fakeChannel.close).toHaveBeenCalled();
      expect(fakeConnection.close).toHaveBeenCalled();
    });

    it('should log error if channel.close throws an error', async () => {
      const fakeChannel = { close: jest.fn().mockRejectedValue(new Error('channel error')) };
      __setChannel(fakeChannel);
      __setConnection(undefined);
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await closeRabbitMQ();
      expect(errorSpy).toHaveBeenCalledWith('Error closing RabbitMQ', expect.any(Error));
      errorSpy.mockRestore();
    });

    it('should log error if connection.close throws an error', async () => {
      const fakeChannel = { close: jest.fn().mockResolvedValue() };
      __setChannel(fakeChannel);
      const fakeConnection = { close: jest.fn().mockRejectedValue(new Error('connection error')) };
      __setConnection(fakeConnection);
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await closeRabbitMQ();
      expect(errorSpy).toHaveBeenCalledWith('Error closing RabbitMQ', expect.any(Error));
      errorSpy.mockRestore();
    });

    it('should resolve even if channel and connection are undefined', async () => {
      __setChannel(undefined);
      __setConnection(undefined);
      await expect(closeRabbitMQ()).resolves.toBeUndefined();
    });
  });
});
