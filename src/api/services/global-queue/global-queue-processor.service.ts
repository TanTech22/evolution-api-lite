import { ConfigService } from '../../../config/env.config';
import { Logger } from '../../../config/logger.config';
import axios from 'axios';
import { GlobalTokenBucket, TokenBucketConfig } from './token-bucket.service';
import { RabbitMQGlobalQueueService, GlobalQueueMessage } from './rabbitmq-queue.service';

export interface MonitoringWebhookPayload {
  event: 'queue.error' | 'queue.stats' | 'filter.applied' | 'rate.limit.exceeded';
  timestamp: string;
  instance?: string;
  data: {
    error?: string;
    queueSize?: number;
    processedCount?: number;
    filteredCount?: number;
    rateLimitHits?: number;
    audioFilterStats?: {
      tooShort: number;
      tooLong: number;
      processed: number;
    };
  };
  server_url: string;
}

export interface ProcessorStats {
  isRunning: boolean;
  processedToday: number;
  rateLimitHits: number;
  errors: number;
  lastProcessedAt: string | null;
  queueSize: number;
  tokenBucketStatus: any;
}

export class GlobalQueueProcessor {
  private readonly logger = new Logger('GlobalQueueProcessor');
  private readonly configService: ConfigService;
  private readonly tokenBucket: GlobalTokenBucket;
  private readonly rabbitmqService: RabbitMQGlobalQueueService;
  private isProcessing = false;
  private stats: ProcessorStats = {
    isRunning: false,
    processedToday: 0,
    rateLimitHits: 0,
    errors: 0,
    lastProcessedAt: null,
    queueSize: 0,
    tokenBucketStatus: null,
  };

  constructor(configService?: ConfigService) {
    this.configService = configService || new ConfigService();

    const globalQueueConfig = this.configService.get('GLOBAL_QUEUE');

    // Initialize Token Bucket
    const tokenBucketConfig: TokenBucketConfig = {
      capacity: globalQueueConfig.TOKEN_BUCKET.CAPACITY,
      refillRate: globalQueueConfig.TOKEN_BUCKET.REFILL_RATE,
      refillInterval: globalQueueConfig.TOKEN_BUCKET.REFILL_INTERVAL,
    };

    this.tokenBucket = new GlobalTokenBucket(tokenBucketConfig);
    this.rabbitmqService = new RabbitMQGlobalQueueService(configService);
  }

  async initialize(): Promise<void> {
    const globalQueueConfig = this.configService.get('GLOBAL_QUEUE');

    if (!globalQueueConfig.ENABLED) {
      this.logger.warn('Global Queue is disabled');
      return;
    }

    try {
      await this.rabbitmqService.initialize();
      this.logger.info('Global Queue Processor initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Global Queue Processor:', error);
      throw error;
    }
  }

  async startProcessing(): Promise<void> {
    if (this.isProcessing) {
      this.logger.warn('Global Queue Processor is already running');
      return;
    }

    const globalQueueConfig = this.configService.get('GLOBAL_QUEUE');

    if (!globalQueueConfig.ENABLED) {
      this.logger.warn('Cannot start processing: Global Queue is disabled');
      return;
    }

    this.isProcessing = true;
    this.stats.isRunning = true;

    this.logger.info('Starting Global Queue Processor...');

    try {
      await this.rabbitmqService.consume(async (message: GlobalQueueMessage) => {
        await this.processMessage(message);
      });

      // Start metrics collection interval
      this.startMetricsCollection();

    } catch (error) {
      this.logger.error('Error starting Global Queue Processor:', error);
      this.isProcessing = false;
      this.stats.isRunning = false;
      throw error;
    }
  }

  private async processMessage(message: GlobalQueueMessage): Promise<void> {
    try {
      // Check rate limiting with token bucket
      const canProcess = await this.tokenBucket.consume(1);

      if (!canProcess) {
        this.stats.rateLimitHits++;
        this.logger.warn(`Rate limit exceeded for message ${message.id}`);

        await this.sendMonitoringWebhook({
          event: 'rate.limit.exceeded',
          timestamp: new Date().toISOString(),
          instance: message.instanceName,
          data: {
            rateLimitHits: this.stats.rateLimitHits,
          },
          server_url: this.configService.get('SERVER').URL,
        });

        // Reject message back to queue for later processing
        throw new Error('Rate limit exceeded');
      }

      // Process the main webhook
      await this.sendMainWebhook(message);

      // Update statistics
      this.stats.processedToday++;
      this.stats.lastProcessedAt = new Date().toISOString();
      this.stats.queueSize = await this.rabbitmqService.getQueueSize();
      this.stats.tokenBucketStatus = this.tokenBucket.getStatus();

      this.logger.debug(`Successfully processed message ${message.id} from instance ${message.instanceName}`);

    } catch (error) {
      this.stats.errors++;
      this.logger.error(`Error processing message ${message.id}:`, error);

      await this.sendMonitoringWebhook({
        event: 'queue.error',
        timestamp: new Date().toISOString(),
        instance: message.instanceName,
        data: {
          error: error.message,
          queueSize: await this.rabbitmqService.getQueueSize(),
        },
        server_url: this.configService.get('SERVER').URL,
      });

      throw error; // Re-throw to let RabbitMQ handle retry logic
    }
  }

  private async sendMainWebhook(message: GlobalQueueMessage): Promise<void> {
    // Get instance webhook URL from database or config
    const webhookUrl = await this.getInstanceWebhookUrl(message.instanceName);

    if (!webhookUrl) {
      this.logger.warn(`No webhook URL configured for instance ${message.instanceName}`);
      return;
    }

    const payload = {
      event: 'messages.upsert',
      instance: message.instanceName,
      data: message.messageData,
      server_url: this.configService.get('SERVER').URL,
      apikey: this.configService.get('AUTHENTICATION').API_KEY.KEY,
      timestamp: message.timestamp,
    };

    try {
      await axios.post(webhookUrl, payload, {
        timeout: 30000, // 30 seconds timeout
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Evolution-API-Global-Queue',
        },
      });

      this.logger.debug(`Main webhook sent successfully for instance ${message.instanceName}`);

    } catch (error) {
      this.logger.error(`Failed to send main webhook for instance ${message.instanceName}:`, error);
      throw error;
    }
  }

  private async sendMonitoringWebhook(payload: MonitoringWebhookPayload): Promise<void> {
    const globalQueueConfig = this.configService.get('GLOBAL_QUEUE');
    const monitoringWebhook = globalQueueConfig.MONITORING_WEBHOOK;

    if (!monitoringWebhook?.ENABLED || !monitoringWebhook?.URL) {
      return; // Monitoring webhook not configured
    }

    try {
      await axios.post(monitoringWebhook.URL, payload, {
        timeout: 10000, // 10 seconds timeout
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Evolution-API-Monitoring',
        },
      });

    } catch (error) {
      this.logger.error('Failed to send monitoring webhook:', error);
      // Don't re-throw monitoring webhook errors
    }
  }

  private async getInstanceWebhookUrl(instanceName: string): Promise<string | null> {
    // TODO: Implement database lookup for instance webhook URL
    // For now, return a placeholder
    return process.env.DEFAULT_WEBHOOK_URL || null;
  }

  private startMetricsCollection(): void {
    // Send metrics every 5 minutes
    setInterval(async () => {
      try {
        const queueMetrics = await this.rabbitmqService.getQueueMetrics();

        await this.sendMonitoringWebhook({
          event: 'queue.stats',
          timestamp: new Date().toISOString(),
          data: {
            queueSize: queueMetrics.messageCount,
            processedCount: this.stats.processedToday,
          },
          server_url: this.configService.get('SERVER').URL,
        });

      } catch (error) {
        this.logger.error('Error collecting metrics:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  async stopProcessing(): Promise<void> {
    this.isProcessing = false;
    this.stats.isRunning = false;

    await this.rabbitmqService.close();
    this.logger.info('Global Queue Processor stopped');
  }

  async enqueueMessage(message: GlobalQueueMessage): Promise<boolean> {
    if (!this.rabbitmqService.isConnected()) {
      this.logger.error('RabbitMQ not connected, cannot enqueue message');
      return false;
    }

    return await this.rabbitmqService.publish(message);
  }

  getStats(): ProcessorStats {
    return {
      ...this.stats,
      tokenBucketStatus: this.tokenBucket.getStatus(),
    };
  }

  async getQueueSize(): Promise<number> {
    return await this.rabbitmqService.getQueueSize();
  }

  async getQueueMetrics() {
    return await this.rabbitmqService.getQueueMetrics();
  }

  isRunning(): boolean {
    return this.isProcessing;
  }
}