import { ConfigService } from '../../../config/env.config';
import { Logger } from '../../../config/logger.config';
import * as amqp from 'amqplib/callback_api';

export interface GlobalQueueMessage {
  id: string;
  instanceName: string;
  messageData: any;
  audioMetadata?: {
    url: string;
    duration: number;
    mimeType: string;
  };
  timestamp: number;
  priority: number;
  retryCount?: number;
}

export interface QueueMetrics {
  messageCount: number;
  consumerCount: number;
  totalPublished: number;
  totalConsumed: number;
  totalFailed: number;
  totalRetried: number;
}

export class RabbitMQGlobalQueueService {
  private channel: amqp.Channel | null = null;
  private connection: amqp.Connection | null = null;
  private readonly logger = new Logger('RabbitMQGlobalQueue');
  private readonly queueName = 'global.messages';
  private readonly exchangeName: string;
  private readonly configService: ConfigService;
  private metrics: QueueMetrics = {
    messageCount: 0,
    consumerCount: 0,
    totalPublished: 0,
    totalConsumed: 0,
    totalFailed: 0,
    totalRetried: 0,
  };

  constructor(configService?: ConfigService) {
    this.configService = configService || new ConfigService();
    this.exchangeName = this.configService.get('RABBITMQ').EXCHANGE_NAME || 'evolution_exchange';
  }

  async initialize(): Promise<void> {
    const rabbitmqConfig = this.configService.get('RABBITMQ');

    if (!rabbitmqConfig.ENABLED) {
      this.logger.warn('RabbitMQ is disabled');
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const uri = rabbitmqConfig.URI;

      amqp.connect(uri, (error, connection) => {
        if (error) {
          this.logger.error('Failed to connect to RabbitMQ:', error);
          reject(error);
          return;
        }

        this.connection = connection;

        connection.createChannel((channelError, channel) => {
          if (channelError) {
            this.logger.error('Failed to create RabbitMQ channel:', channelError);
            reject(channelError);
            return;
          }

          this.channel = channel;

          // Configure exchange
          channel.assertExchange(this.exchangeName, 'topic', {
            durable: true,
            autoDelete: false,
          });

          // Configure global messages queue
          channel.assertQueue(this.queueName, {
            durable: true,
            autoDelete: false,
            arguments: {
              'x-queue-type': 'quorum',
              'x-max-retries': 3,
              'x-dead-letter-exchange': `${this.exchangeName}.dlx`,
              'x-dead-letter-routing-key': 'failed.messages',
            },
          });

          // Configure dead letter queue for failed messages
          channel.assertExchange(`${this.exchangeName}.dlx`, 'topic', {
            durable: true,
            autoDelete: false,
          });

          channel.assertQueue('failed.messages', {
            durable: true,
            autoDelete: false,
            arguments: {
              'x-queue-type': 'quorum',
            },
          });

          channel.bindQueue('failed.messages', `${this.exchangeName}.dlx`, 'failed.messages');
          channel.bindQueue(this.queueName, this.exchangeName, 'global.messages');

          this.logger.info('Global RabbitMQ queue initialized successfully');
          resolve();
        });
      });
    });
  }

  async publish(message: GlobalQueueMessage): Promise<boolean> {
    if (!this.channel) {
      this.logger.error('RabbitMQ channel not initialized');
      return false;
    }

    try {
      const messageBuffer = Buffer.from(JSON.stringify(message));
      const options = {
        persistent: true,
        priority: message.priority || 1,
        timestamp: Date.now(),
        messageId: message.id,
      };

      const success = this.channel.publish(
        this.exchangeName,
        'global.messages',
        messageBuffer,
        options
      );

      if (success) {
        this.metrics.totalPublished++;
        this.logger.debug(`Message published to global queue: ${message.id}`);
      } else {
        this.logger.warn(`Failed to publish message to global queue: ${message.id}`);
      }

      return success;
    } catch (error) {
      this.logger.error('Error publishing message to global queue:', error);
      return false;
    }
  }

  async consume(callback: (message: GlobalQueueMessage) => Promise<void>): Promise<void> {
    if (!this.channel) {
      this.logger.error('RabbitMQ channel not initialized');
      return;
    }

    try {
      await this.channel.consume(
        this.queueName,
        async (msg) => {
          if (!msg) {
            return;
          }

          try {
            const messageData: GlobalQueueMessage = JSON.parse(msg.content.toString());
            this.metrics.totalConsumed++;

            this.logger.debug(`Processing message from global queue: ${messageData.id}`);

            await callback(messageData);

            // Acknowledge message on successful processing
            this.channel!.ack(msg);

          } catch (error) {
            this.logger.error('Error processing message from global queue:', error);
            this.metrics.totalFailed++;

            // Reject message and requeue for retry (will eventually go to DLQ)
            this.channel!.nack(msg, false, true);
          }
        },
        {
          noAck: false, // Manual acknowledgment
          consumerTag: `global-queue-consumer-${Date.now()}`,
        }
      );

      this.metrics.consumerCount++;
      this.logger.info('Global queue consumer started successfully');

    } catch (error) {
      this.logger.error('Error setting up global queue consumer:', error);
      throw error;
    }
  }

  async getQueueSize(): Promise<number> {
    if (!this.channel) {
      return 0;
    }

    try {
      const queueInfo = await this.channel.checkQueue(this.queueName);
      this.metrics.messageCount = queueInfo.messageCount;
      return queueInfo.messageCount;
    } catch (error) {
      this.logger.error('Error getting queue size:', error);
      return 0;
    }
  }

  async getQueueMetrics(): Promise<QueueMetrics> {
    const messageCount = await this.getQueueSize();
    return {
      ...this.metrics,
      messageCount,
    };
  }

  async purgeQueue(): Promise<boolean> {
    if (!this.channel) {
      this.logger.error('RabbitMQ channel not initialized');
      return false;
    }

    try {
      await this.channel.purgeQueue(this.queueName);
      this.logger.info('Global queue purged successfully');
      return true;
    } catch (error) {
      this.logger.error('Error purging global queue:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }

      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }

      this.logger.info('RabbitMQ global queue service closed');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ global queue service:', error);
    }
  }

  isConnected(): boolean {
    return this.channel !== null && this.connection !== null;
  }
}