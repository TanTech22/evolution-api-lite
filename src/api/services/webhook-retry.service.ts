import { Logger } from '@config/logger.config';
import { DualWebhookService, MainWebhookPayload, WebhookResult } from './dual-webhook.service';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableStatusCodes: number[];
}

export interface FailedWebhook {
  id: string;
  payload: MainWebhookPayload;
  webhookUrl: string;
  attempts: number;
  lastAttempt: Date;
  nextRetry: Date;
  lastError?: string;
  lastStatusCode?: number;
}

export class WebhookRetryService {
  private logger = new Logger(WebhookRetryService.name);
  private failedWebhooks: Map<string, FailedWebhook> = new Map();
  private retryTimer?: NodeJS.Timer;

  private defaultConfig: RetryConfig = {
    maxRetries: 5,
    baseDelay: 1000, // 1 second
    maxDelay: 300000, // 5 minutes
    backoffFactor: 2,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504], // Retryable HTTP status codes
  };

  constructor(
    private dualWebhookService: DualWebhookService,
    private config: RetryConfig = {}
  ) {
    this.config = { ...this.defaultConfig, ...config };
    this.startRetryProcessor();
  }

  async sendWithRetry(
    payload: MainWebhookPayload,
    webhookUrl?: string
  ): Promise<WebhookResult> {
    const result = await this.dualWebhookService.sendMainWebhook(payload, webhookUrl);

    if (!result.success && this.shouldRetry(result)) {
      await this.scheduleRetry(payload, webhookUrl || '', result);
    }

    return result;
  }

  private shouldRetry(result: WebhookResult): boolean {
    if (!result.statusCode) {
      return true; // Network errors should be retried
    }

    return this.config.retryableStatusCodes.includes(result.statusCode);
  }

  private async scheduleRetry(
    payload: MainWebhookPayload,
    webhookUrl: string,
    lastResult: WebhookResult
  ): Promise<void> {
    const webhookId = this.generateWebhookId(payload, webhookUrl);
    const existingWebhook = this.failedWebhooks.get(webhookId);

    const attempts = existingWebhook ? existingWebhook.attempts + 1 : 1;

    if (attempts > this.config.maxRetries) {
      this.logger.error(`Webhook ${webhookId} exceeded max retries (${this.config.maxRetries})`);

      // Send monitoring webhook about permanent failure
      await this.dualWebhookService.sendError(
        `Webhook permanently failed after ${this.config.maxRetries} attempts`,
        payload.instance,
        {
          webhookId,
          finalError: lastResult.error,
          finalStatusCode: lastResult.statusCode,
          totalAttempts: attempts,
        }
      );

      this.failedWebhooks.delete(webhookId);
      return;
    }

    const delay = this.calculateDelay(attempts);
    const nextRetry = new Date(Date.now() + delay);

    const failedWebhook: FailedWebhook = {
      id: webhookId,
      payload,
      webhookUrl,
      attempts,
      lastAttempt: new Date(),
      nextRetry,
      lastError: lastResult.error,
      lastStatusCode: lastResult.statusCode,
    };

    this.failedWebhooks.set(webhookId, failedWebhook);

    this.logger.warn(
      `Scheduled webhook retry ${attempts}/${this.config.maxRetries} for ${webhookId} in ${delay}ms`
    );

    // Send monitoring webhook about retry
    await this.dualWebhookService.sendMonitoringWebhook({
      event: 'webhook.failed',
      timestamp: new Date().toISOString(),
      instance: payload.instance,
      data: {
        error: `Webhook retry scheduled (attempt ${attempts}/${this.config.maxRetries})`,
        webhookUrl,
        statusCode: lastResult.statusCode,
        responseTime: lastResult.responseTime,
      },
      server_url: payload.server_url,
    });
  }

  private calculateDelay(attempts: number): number {
    const exponentialDelay = this.config.baseDelay * Math.pow(this.config.backoffFactor, attempts - 1);

    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * exponentialDelay;

    return Math.min(exponentialDelay + jitter, this.config.maxDelay);
  }

  private generateWebhookId(payload: MainWebhookPayload, webhookUrl: string): string {
    const key = `${payload.instance}_${payload.event}_${webhookUrl}`;
    return Buffer.from(key).toString('base64').substring(0, 16);
  }

  private startRetryProcessor(): void {
    this.retryTimer = setInterval(() => {
      this.processRetries();
    }, 5000); // Check every 5 seconds

    this.logger.debug('Webhook retry processor started');
  }

  private async processRetries(): Promise<void> {
    const now = new Date();
    const readyForRetry = Array.from(this.failedWebhooks.values())
      .filter(webhook => webhook.nextRetry <= now);

    if (readyForRetry.length === 0) {
      return;
    }

    this.logger.debug(`Processing ${readyForRetry.length} webhook retries`);

    for (const webhook of readyForRetry) {
      try {
        const result = await this.dualWebhookService.sendMainWebhook(
          webhook.payload,
          webhook.webhookUrl
        );

        if (result.success) {
          this.logger.info(`Webhook retry succeeded for ${webhook.id} after ${webhook.attempts} attempts`);
          this.failedWebhooks.delete(webhook.id);

          // Send success monitoring webhook
          await this.dualWebhookService.sendMonitoringWebhook({
            event: 'queue.stats',
            timestamp: new Date().toISOString(),
            instance: webhook.payload.instance,
            data: {
              processedCount: 1,
            },
            server_url: webhook.payload.server_url,
          });
        } else {
          // Schedule another retry if needed
          await this.scheduleRetry(webhook.payload, webhook.webhookUrl, result);
        }
      } catch (error) {
        this.logger.error(`Error processing webhook retry for ${webhook.id}: ${error.message}`);

        // Treat unexpected errors as failed attempts
        await this.scheduleRetry(webhook.payload, webhook.webhookUrl, {
          success: false,
          error: error.message,
        });
      }
    }
  }

  public getRetryStats(): {
    pending: number;
    totalFailed: number;
    averageAttempts: number;
  } {
    const webhooks = Array.from(this.failedWebhooks.values());

    return {
      pending: webhooks.length,
      totalFailed: webhooks.length,
      averageAttempts: webhooks.length > 0
        ? webhooks.reduce((sum, w) => sum + w.attempts, 0) / webhooks.length
        : 0,
    };
  }

  public getFailedWebhooks(): FailedWebhook[] {
    return Array.from(this.failedWebhooks.values());
  }

  public clearFailedWebhook(webhookId: string): boolean {
    return this.failedWebhooks.delete(webhookId);
  }

  public clearAllFailedWebhooks(): void {
    this.failedWebhooks.clear();
    this.logger.info('Cleared all failed webhooks');
  }

  public stop(): void {
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = undefined;
      this.logger.debug('Webhook retry processor stopped');
    }
  }
}