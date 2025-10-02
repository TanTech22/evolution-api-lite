import axios from 'axios';
import { ConfigService } from '@config/env.config';
import { Logger } from '@config/logger.config';

export interface MainWebhookPayload {
  event: string;
  instance: string;
  data: {
    key: any;
    message: any;
    audioUrl?: string;
    audioDuration?: number;
    mimeType?: string;
    [key: string]: any;
  };
  server_url: string;
  apikey: string;
  timestamp?: string;
}

export interface MonitoringWebhookPayload {
  event: 'queue.error' | 'queue.stats' | 'filter.applied' | 'rate_limit.exceeded' | 'webhook.failed';
  timestamp: string;
  instance?: string;
  data: {
    error?: string;
    queueSize?: number;
    processedCount?: number;
    filteredCount?: number;
    audioFilterStats?: {
      tooShort: number;
      tooLong: number;
      processed: number;
    };
    rateLimitStats?: {
      tokens: number;
      capacity: number;
      refillRate: string;
    };
    webhookUrl?: string;
    statusCode?: number;
    responseTime?: number;
  };
  server_url: string;
}

export interface WebhookResult {
  success: boolean;
  statusCode?: number;
  responseTime?: number;
  error?: string;
}

export class DualWebhookService {
  private logger = new Logger(DualWebhookService.name);

  constructor(private configService: ConfigService) {}

  async sendMainWebhook(payload: MainWebhookPayload, webhookUrl?: string): Promise<WebhookResult> {
    const startTime = Date.now();

    try {
      if (!webhookUrl) {
        const globalWebhook = this.configService.get('WEBHOOK')?.GLOBAL;
        if (!globalWebhook?.ENABLED || !globalWebhook?.URL) {
          this.logger.warn('No webhook URL configured for main webhook');
          return { success: false, error: 'No webhook URL configured' };
        }
        webhookUrl = globalWebhook.URL;
      }

      const enrichedPayload = {
        ...payload,
        timestamp: new Date().toISOString(),
        server_url: this.configService.get('SERVER').URL,
        apikey: this.configService.get('AUTHENTICATION').API_KEY.KEY,
      };

      this.logger.verbose(`Sending main webhook to: ${webhookUrl}`, 'WEBHOOKS');

      const response = await axios.post(webhookUrl, enrichedPayload, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Evolution-API-Lite/Dual-Webhook',
        },
      });

      const responseTime = Date.now() - startTime;

      this.logger.verbose(`Main webhook delivered successfully: ${response.status} (${responseTime}ms)`, 'WEBHOOKS');

      return {
        success: true,
        statusCode: response.status,
        responseTime,
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.message || error.message;

      this.logger.error(`Main webhook failed: ${errorMessage} (${responseTime}ms)`, 'WEBHOOKS');

      // Send monitoring webhook about this failure
      await this.sendMonitoringWebhook({
        event: 'webhook.failed',
        timestamp: new Date().toISOString(),
        instance: payload.instance,
        data: {
          error: errorMessage,
          webhookUrl,
          statusCode,
          responseTime,
        },
        server_url: this.configService.get('SERVER').URL,
      });

      return {
        success: false,
        statusCode,
        responseTime,
        error: errorMessage,
      };
    }
  }

  async sendMonitoringWebhook(payload: MonitoringWebhookPayload): Promise<WebhookResult> {
    const startTime = Date.now();

    try {
      const monitoringConfig = this.configService.get('GLOBAL_QUEUE')?.MONITORING_WEBHOOK;

      if (!monitoringConfig?.ENABLED || !monitoringConfig?.URL) {
        this.logger.debug('Monitoring webhook not configured, skipping');
        return { success: false, error: 'Monitoring webhook not configured' };
      }

      const enrichedPayload = {
        ...payload,
        server_url: this.configService.get('SERVER').URL,
      };

      this.logger.verbose(`Sending monitoring webhook: ${payload.event}`, 'WEBHOOKS');

      const response = await axios.post(monitoringConfig.URL, enrichedPayload, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Evolution-API-Lite/Monitoring-Webhook',
        },
      });

      const responseTime = Date.now() - startTime;

      this.logger.verbose(`Monitoring webhook delivered: ${response.status} (${responseTime}ms)`, 'WEBHOOKS');

      return {
        success: true,
        statusCode: response.status,
        responseTime,
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error.response?.data?.message || error.message;

      this.logger.error(`Monitoring webhook failed: ${errorMessage} (${responseTime}ms)`, 'WEBHOOKS');

      return {
        success: false,
        statusCode: error.response?.status,
        responseTime,
        error: errorMessage,
      };
    }
  }

  async sendQueueStats(stats: {
    queueSize: number;
    processedCount: number;
    audioFilterStats?: any;
    rateLimitStats?: any;
  }): Promise<void> {
    await this.sendMonitoringWebhook({
      event: 'queue.stats',
      timestamp: new Date().toISOString(),
      data: {
        queueSize: stats.queueSize,
        processedCount: stats.processedCount,
        audioFilterStats: stats.audioFilterStats,
        rateLimitStats: stats.rateLimitStats,
      },
      server_url: this.configService.get('SERVER').URL,
    });
  }

  async sendFilterApplied(instance: string, filterType: string, value: any): Promise<void> {
    await this.sendMonitoringWebhook({
      event: 'filter.applied',
      timestamp: new Date().toISOString(),
      instance,
      data: {
        filteredCount: 1,
        audioFilterStats: filterType === 'duration' ? {
          [value.reason]: 1,
          processed: 0,
          tooShort: value.reason === 'tooShort' ? 1 : 0,
          tooLong: value.reason === 'tooLong' ? 1 : 0,
        } : undefined,
      },
      server_url: this.configService.get('SERVER').URL,
    });
  }

  async sendRateLimitExceeded(instance?: string): Promise<void> {
    await this.sendMonitoringWebhook({
      event: 'rate_limit.exceeded',
      timestamp: new Date().toISOString(),
      instance,
      data: {
        error: 'Rate limit exceeded',
      },
      server_url: this.configService.get('SERVER').URL,
    });
  }

  async sendError(error: string, instance?: string, additionalData?: any): Promise<void> {
    await this.sendMonitoringWebhook({
      event: 'queue.error',
      timestamp: new Date().toISOString(),
      instance,
      data: {
        error,
        ...additionalData,
      },
      server_url: this.configService.get('SERVER').URL,
    });
  }
}