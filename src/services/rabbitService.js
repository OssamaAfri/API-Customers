const amqp = require('amqplib');
require('dotenv').config();

let connection;
let channel;

const connectRabbitMQ = async () => {
  if (process.env.NODE_ENV === 'test' || process.env.SKIP_RABBITMQ === 'true') {
    console.log('Skipping RabbitMQ connection in test environment');
    return;
  }
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URI);
    channel = await connection.createChannel();
    console.log('RabbitMQ connected');
  } catch (error) {
    console.error('RabbitMQ connection error', error);
  }
};

const publishMessage = async (exchange, message) => {
  if (!channel) return;
  await channel.assertExchange(exchange, 'fanout', { durable: true });
  channel.publish(exchange, '', Buffer.from(JSON.stringify(message)));
};

const closeRabbitMQ = async () => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
  } catch (error) {
    console.error('Error closing RabbitMQ', error);
  }
};

// Fonctions supplémentaires pour les tests
const __setChannel = (newChannel) => { channel = newChannel; };
const __getChannel = () => channel;
const __setConnection = (newConnection) => { connection = newConnection; };
const __getConnection = () => connection;

module.exports = {
  connectRabbitMQ,
  publishMessage,
  closeRabbitMQ,
  __setChannel,
  __getChannel,
  __setConnection,
  __getConnection
};
