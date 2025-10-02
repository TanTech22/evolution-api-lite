import { Logger } from '@config/logger.config';
import { ConfigService } from '@config/env.config';

export interface WebhookLogEntry {
  timestamp: string;
  type: 'main' | 'monitoring';
  event: string;
  instance?: string;
  webhookUrl?: string;
  payload?: any;
  result?: {
    success: boolean;
    statusCode?: number;
    responseTime?: number;
    error?: string;
  };
  metadata?: {
    attempt?: number;
    maxRetries?: number;
    retryScheduled?: boolean;
    rateLimited?: boolean;
    filtered?: boolean;
    queueSize?: number;
  };
}

export interface WebhookMetrics {
  total: number;
  successful: number;
  failed: number;
  retries: number;
  averageResponseTime: number;
  errorsByType: Record<string, number>;
  instanceStats: Record<string, {
    total: number;
    successful: number;
    failed: number;
  }>;
}

export class WebhookLoggerService {
  private logger = new Logger(WebhookLoggerService.name);
  private logs: WebhookLogEntry[] = [];
  private maxLogsInMemory = 1000;
  private metrics: WebhookMetrics = {
    total: 0,
    successful: 0,
    failed: 0,
    retries: 0,
    averageResponseTime: 0,
    errorsByType: {},
    instanceStats: {},
  };

  constructor(private configService: ConfigService) {
    this.startPeriodicCleanup();
  }

  logWebhookAttempt(entry: WebhookLogEntry): void {
    const enrichedEntry: WebhookLogEntry = {
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString(),
    };

    // Add to in-memory logs
    this.logs.push(enrichedEntry);

    // Maintain memory limit
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs = this.logs.slice(-this.maxLogsInMemory);
    }

    // Update metrics
    this.updateMetrics(enrichedEntry);

    // Log to console with appropriate level
    this.logToConsole(enrichedEntry);
  }

  private updateMetrics(entry: WebhookLogEntry): void {
    this.metrics.total++;

    if (entry.result) {
      if (entry.result.success) {
        this.metrics.successful++;
      } else {
        this.metrics.failed++;
      }

      if (entry.metadata?.attempt && entry.metadata.attempt > 1) {
        this.metrics.retries++;
      }

      // Update response time average
      if (entry.result.responseTime) {
        const totalResponseTime = this.metrics.averageResponseTime * (this.metrics.total - 1);
        this.metrics.averageResponseTime = (totalResponseTime + entry.result.responseTime) / this.metrics.total;
      }

      // Track errors by type
      if (!entry.result.success && entry.result.error) {
        const errorType = this.categorizeError(entry.result.error, entry.result.statusCode);
        this.metrics.errorsByType[errorType] = (this.metrics.errorsByType[errorType] || 0) + 1;
      }
    }

    // Update instance stats
    if (entry.instance) {
      if (!this.metrics.instanceStats[entry.instance]) {
        this.metrics.instanceStats[entry.instance] = {
          total: 0,
          successful: 0,
          failed: 0,
        };
      }

      const instanceStats = this.metrics.instanceStats[entry.instance];
      instanceStats.total++;

      if (entry.result?.success) {
        instanceStats.successful++;
      } else if (entry.result?.success === false) {
        instanceStats.failed++;
      }
    }
  }

  private categorizeError(error: string, statusCode?: number): string {
    if (statusCode) {
      if (statusCode >= 400 && statusCode < 500) {
        return 'client_error';
      }
      if (statusCode >= 500) {
        return 'server_error';
      }
      if (statusCode === 408 || statusCode === 429) {
        return 'rate_limit_or_timeout';
      }
    }

    if (error.toLowerCase().includes('timeout')) {
      return 'timeout';
    }
    if (error.toLowerCase().includes('network') || error.toLowerCase().includes('econnreset')) {
      return 'network_error';
    }
    if (error.toLowerCase().includes('dns')) {
      return 'dns_error';
    }

    return 'unknown_error';
  }

  private logToConsole(entry: WebhookLogEntry): void {
    const logData = {
      event: entry.event,
      type: entry.type,
      instance: entry.instance,
      success: entry.result?.success,
      statusCode: entry.result?.statusCode,
      responseTime: entry.result?.responseTime,
      error: entry.result?.error,
      attempt: entry.metadata?.attempt,
      retryScheduled: entry.metadata?.retryScheduled,
    };

    if (entry.result?.success) {
      this.logger.verbose(
        `✅ ${entry.type} webhook delivered: ${entry.event} (${entry.result.responseTime}ms)`,
        'WEBHOOKS',
        logData
      );
    } else if (entry.result?.success === false) {
      if (entry.metadata?.retryScheduled) {
        this.logger.warn(
          `⏳ ${entry.type} webhook failed, retry scheduled: ${entry.event} (attempt ${entry.metadata.attempt})`,
          'WEBHOOKS',
          logData
        );
      } else {
        this.logger.error(
          `❌ ${entry.type} webhook failed permanently: ${entry.event}`,
          'WEBHOOKS',
          logData
        );
      }
    } else {
      this.logger.debug(
        `📤 ${entry.type} webhook sent: ${entry.event}`,
        'WEBHOOKS',
        logData
      );
    }
  }

  getMetrics(): WebhookMetrics {
    return { ...this.metrics };
  }

  getRecentLogs(limit = 100): WebhookLogEntry[] {
    return this.logs.slice(-limit);
  }

  getLogsByInstance(instance: string, limit = 50): WebhookLogEntry[] {
    return this.logs
      .filter(log => log.instance === instance)
      .slice(-limit);
  }

  getErrorLogs(limit = 50): WebhookLogEntry[] {
    return this.logs
      .filter(log => log.result?.success === false)
      .slice(-limit);
  }

  getMetricsSummary(): {
    successRate: number;
    errorRate: number;
    retryRate: number;
    avgResponseTime: number;
    topErrors: Array<{ type: string; count: number }>;
    topInstances: Array<{ instance: string; total: number; successRate: number }>;
  } {
    const successRate = this.metrics.total > 0
      ? (this.metrics.successful / this.metrics.total) * 100
      : 0;

    const errorRate = this.metrics.total > 0
      ? (this.metrics.failed / this.metrics.total) * 100
      : 0;

    const retryRate = this.metrics.total > 0
      ? (this.metrics.retries / this.metrics.total) * 100
      : 0;

    const topErrors = Object.entries(this.metrics.errorsByType)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topInstances = Object.entries(this.metrics.instanceStats)
      .map(([instance, stats]) => ({
        instance,
        total: stats.total,
        successRate: stats.total > 0 ? (stats.successful / stats.total) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return {
      successRate,
      errorRate,
      retryRate,
      avgResponseTime: this.metrics.averageResponseTime,
      topErrors,
      topInstances,
    };
  }

  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = [
        'timestamp',
        'type',
        'event',
        'instance',
        'success',
        'statusCode',
        'responseTime',
        'error',
        'attempt',
      ];

      const rows = this.logs.map(log => [
        log.timestamp,
        log.type,
        log.event,
        log.instance || '',
        log.result?.success?.toString() || '',
        log.result?.statusCode?.toString() || '',
        log.result?.responseTime?.toString() || '',
        log.result?.error || '',
        log.metadata?.attempt?.toString() || '',
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      totalLogs: this.logs.length,
      metrics: this.metrics,
      logs: this.logs,
    }, null, 2);
  }

  clearLogs(): void {
    this.logs = [];
    this.metrics = {
      total: 0,
      successful: 0,
      failed: 0,
      retries: 0,
      averageResponseTime: 0,
      errorsByType: {},
      instanceStats: {},
    };
    this.logger.info('Webhook logs and metrics cleared');
  }

  private startPeriodicCleanup(): void {
    // Clean up old logs every hour
    setInterval(() => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const initialCount = this.logs.length;

      this.logs = this.logs.filter(log => new Date(log.timestamp) > oneHourAgo);

      if (this.logs.length < initialCount) {
        this.logger.debug(`Cleaned up ${initialCount - this.logs.length} old webhook logs`);
      }
    }, 60 * 60 * 1000); // 1 hour
  }
}