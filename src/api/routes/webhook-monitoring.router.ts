import { RouterBroker } from '@api/abstract/abstract.router';
import { ConfigService } from '@config/env.config';
import { RequestHandler, Router } from 'express';
import { HttpStatus } from './index.router';
import { WebhookLoggerService } from '@api/services/webhook-logger.service';
import { WebhookRetryService } from '@api/services/webhook-retry.service';
import { DualWebhookService } from '@api/services/dual-webhook.service';

export class WebhookMonitoringRouter extends RouterBroker {
  private webhookLogger: WebhookLoggerService;
  private webhookRetry: WebhookRetryService;
  private dualWebhook: DualWebhookService;

  constructor(
    readonly configService: ConfigService,
    ...guards: RequestHandler[]
  ) {
    super();

    this.dualWebhook = new DualWebhookService(configService);
    this.webhookLogger = new WebhookLoggerService(configService);
    this.webhookRetry = new WebhookRetryService(this.dualWebhook);

    this.router
      // Get webhook metrics and statistics
      .get('/metrics', ...guards, async (req, res) => {
        try {
          const metrics = this.webhookLogger.getMetrics();
          const summary = this.webhookLogger.getMetricsSummary();
          const retryStats = this.webhookRetry.getRetryStats();

          return res.status(HttpStatus.OK).json({
            status: 'SUCCESS',
            metrics: {
              ...metrics,
              retry: retryStats,
              summary,
            },
          });
        } catch (error) {
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'ERROR',
            error: true,
            response: { message: error.message },
          });
        }
      })

      // Get recent webhook logs
      .get('/logs', ...guards, async (req, res) => {
        try {
          const limit = parseInt(req.query.limit as string) || 100;
          const type = req.query.type as string;
          const instance = req.query.instance as string;

          let logs;
          if (instance) {
            logs = this.webhookLogger.getLogsByInstance(instance, limit);
          } else if (type === 'errors') {
            logs = this.webhookLogger.getErrorLogs(limit);
          } else {
            logs = this.webhookLogger.getRecentLogs(limit);
          }

          return res.status(HttpStatus.OK).json({
            status: 'SUCCESS',
            data: {
              logs,
              total: logs.length,
            },
          });
        } catch (error) {
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'ERROR',
            error: true,
            response: { message: error.message },
          });
        }
      })

      // Export webhook logs
      .get('/logs/export', ...guards, async (req, res) => {
        try {
          const format = (req.query.format as string) || 'json';
          const exportData = this.webhookLogger.exportLogs(format as 'json' | 'csv');

          const filename = `webhook-logs-${new Date().toISOString().split('T')[0]}.${format}`;
          const contentType = format === 'csv' ? 'text/csv' : 'application/json';

          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          res.setHeader('Content-Type', contentType);

          return res.status(HttpStatus.OK).send(exportData);
        } catch (error) {
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'ERROR',
            error: true,
            response: { message: error.message },
          });
        }
      })

      // Get failed webhooks that are pending retry
      .get('/failed', ...guards, async (req, res) => {
        try {
          const failedWebhooks = this.webhookRetry.getFailedWebhooks();

          return res.status(HttpStatus.OK).json({
            status: 'SUCCESS',
            data: {
              failedWebhooks,
              total: failedWebhooks.length,
            },
          });
        } catch (error) {
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'ERROR',
            error: true,
            response: { message: error.message },
          });
        }
      })

      // Clear a specific failed webhook
      .delete('/failed/:webhookId', ...guards, async (req, res) => {
        try {
          const { webhookId } = req.params;
          const cleared = this.webhookRetry.clearFailedWebhook(webhookId);

          if (cleared) {
            return res.status(HttpStatus.OK).json({
              status: 'SUCCESS',
              data: { message: `Failed webhook ${webhookId} cleared` },
            });
          } else {
            return res.status(HttpStatus.NOT_FOUND).json({
              status: 'ERROR',
              error: true,
              response: { message: `Failed webhook ${webhookId} not found` },
            });
          }
        } catch (error) {
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'ERROR',
            error: true,
            response: { message: error.message },
          });
        }
      })

      // Clear all failed webhooks
      .delete('/failed', ...guards, async (req, res) => {
        try {
          this.webhookRetry.clearAllFailedWebhooks();

          return res.status(HttpStatus.OK).json({
            status: 'SUCCESS',
            data: { message: 'All failed webhooks cleared' },
          });
        } catch (error) {
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'ERROR',
            error: true,
            response: { message: error.message },
          });
        }
      })

      // Test webhook connectivity
      .post('/test', ...guards, async (req, res) => {
        try {
          const { url, payload } = req.body;

          if (!url) {
            return res.status(HttpStatus.BAD_REQUEST).json({
              status: 'ERROR',
              error: true,
              response: { message: 'Webhook URL is required' },
            });
          }

          const testPayload = payload || {
            event: 'webhook.test',
            instance: 'test',
            data: {
              message: 'Webhook connectivity test',
              timestamp: new Date().toISOString(),
            },
            server_url: this.configService.get('SERVER').URL,
            apikey: this.configService.get('AUTHENTICATION').API_KEY.KEY,
          };

          const result = await this.dualWebhook.sendMainWebhook(testPayload, url);

          return res.status(HttpStatus.OK).json({
            status: result.success ? 'SUCCESS' : 'ERROR',
            data: {
              success: result.success,
              statusCode: result.statusCode,
              responseTime: result.responseTime,
              error: result.error,
            },
          });
        } catch (error) {
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'ERROR',
            error: true,
            response: { message: error.message },
          });
        }
      })

      // Clear webhook logs and metrics
      .delete('/logs', ...guards, async (req, res) => {
        try {
          this.webhookLogger.clearLogs();

          return res.status(HttpStatus.OK).json({
            status: 'SUCCESS',
            data: { message: 'Webhook logs and metrics cleared' },
          });
        } catch (error) {
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'ERROR',
            error: true,
            response: { message: error.message },
          });
        }
      })

      // Health check for webhook system
      .get('/health', ...guards, async (req, res) => {
        try {
          const metrics = this.webhookLogger.getMetrics();
          const summary = this.webhookLogger.getMetricsSummary();
          const retryStats = this.webhookRetry.getRetryStats();

          const isHealthy = summary.successRate >= 95 && retryStats.pending < 100;

          return res.status(HttpStatus.OK).json({
            status: 'SUCCESS',
            data: {
              healthy: isHealthy,
              timestamp: new Date().toISOString(),
              summary: {
                successRate: summary.successRate,
                totalWebhooks: metrics.total,
                pendingRetries: retryStats.pending,
                avgResponseTime: summary.avgResponseTime,
              },
              config: {
                globalWebhookEnabled: this.configService.get('WEBHOOK')?.GLOBAL?.ENABLED || false,
                monitoringWebhookEnabled: this.configService.get('GLOBAL_QUEUE')?.MONITORING_WEBHOOK?.ENABLED || false,
              },
            },
          });
        } catch (error) {
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'ERROR',
            error: true,
            response: { message: error.message },
          });
        }
      });
  }

  public readonly router: Router = Router();
}