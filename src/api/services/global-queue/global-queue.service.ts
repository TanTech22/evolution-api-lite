import { ConfigService } from '../../../config/env.config';
import { GlobalTokenBucket, TokenBucketConfig } from './token-bucket.service';

export class GlobalQueueService {
  private tokenBucket: GlobalTokenBucket;
  private configService: ConfigService;

  constructor(configService?: ConfigService) {
    this.configService = configService || new ConfigService();
    this.initializeTokenBucket();
  }

  private initializeTokenBucket(): void {
    const globalQueueConfig = this.configService.get('GLOBAL_QUEUE');

    if (!globalQueueConfig.ENABLED) {
      console.warn('Global Queue is disabled');
      return;
    }

    const tokenBucketConfig: TokenBucketConfig = {
      capacity: globalQueueConfig.TOKEN_BUCKET.CAPACITY,
      refillRate: globalQueueConfig.TOKEN_BUCKET.REFILL_RATE,
      refillInterval: globalQueueConfig.TOKEN_BUCKET.REFILL_INTERVAL,
    };

    this.tokenBucket = new GlobalTokenBucket(tokenBucketConfig);

    console.log('Global Queue Service initialized with config:', {
      enabled: globalQueueConfig.ENABLED,
      capacity: tokenBucketConfig.capacity,
      refillRate: tokenBucketConfig.refillRate,
      refillInterval: tokenBucketConfig.refillInterval,
    });
  }

  isEnabled(): boolean {
    return this.configService.get('GLOBAL_QUEUE').ENABLED;
  }

  async canProcess(amount: number = 1): Promise<boolean> {
    if (!this.isEnabled() || !this.tokenBucket) {
      return true;
    }

    return await this.tokenBucket.consume(amount);
  }

  getTokenBucketStatus() {
    if (!this.isEnabled() || !this.tokenBucket) {
      return null;
    }

    return this.tokenBucket.getStatus();
  }

  resetTokenBucket(): void {
    if (this.tokenBucket) {
      this.tokenBucket.reset();
    }
  }

  getConfiguration() {
    const globalQueueConfig = this.configService.get('GLOBAL_QUEUE');

    return {
      enabled: globalQueueConfig.ENABLED,
      rateLimit: globalQueueConfig.RATE_LIMIT,
      rateInterval: globalQueueConfig.RATE_INTERVAL,
      tokenBucket: globalQueueConfig.TOKEN_BUCKET,
      monitoringWebhook: globalQueueConfig.MONITORING_WEBHOOK,
    };
  }
}