import { Logger } from '../../../config/logger.config';
import { ConfigService } from '../../../config/env.config';
import { GlobalQueueProcessor, ProcessorStats } from './global-queue-processor.service';
import { RetryHandler } from './retry-handler.service';

export interface QueueMetrics {
  // Queue status
  queueSize: number;
  isProcessorRunning: boolean;

  // Processing metrics
  processedToday: number;
  processedThisHour: number;
  processedThisMinute: number;

  // Performance metrics
  averageProcessingTime: number;
  throughputPerMinute: number;

  // Error metrics
  totalErrors: number;
  errorRate: number;

  // Rate limiting metrics
  rateLimitHits: number;
  rateLimitHitRate: number;

  // Token bucket status
  tokensAvailable: number;
  tokenCapacity: number;
  refillRate: string;

  // Retry metrics
  totalRetryAttempts: number;
  averageRetriesPerMessage: number;

  // Timestamps
  lastProcessedAt: string | null;
  metricsGeneratedAt: string;

  // Health status
  healthStatus: 'healthy' | 'warning' | 'critical';
  healthIssues: string[];
}

export interface PerformanceWindow {
  timestamp: string;
  processed: number;
  errors: number;
  rateLimitHits: number;
  averageProcessingTime: number;
}

export class MetricsService {
  private readonly logger = new Logger('MetricsService');
  private readonly configService: ConfigService;
  private readonly processor: GlobalQueueProcessor;
  private readonly retryHandler: RetryHandler;

  // Performance tracking
  private performanceWindows: PerformanceWindow[] = [];
  private readonly maxWindows = 60; // Keep 60 minutes of data

  // Processing times tracking
  private processingTimes: number[] = [];
  private readonly maxProcessingTimes = 1000; // Keep last 1000 processing times

  // Counters
  private dailyCounters = {
    processed: 0,
    errors: 0,
    rateLimitHits: 0,
    startOfDay: new Date().toDateString(),
  };

  constructor(
    processor: GlobalQueueProcessor,
    retryHandler: RetryHandler,
    configService?: ConfigService
  ) {
    this.processor = processor;
    this.retryHandler = retryHandler;
    this.configService = configService || new ConfigService();

    // Start metrics collection
    this.startMetricsCollection();

    // Reset daily counters at midnight
    this.scheduleCounterReset();
  }

  async getMetrics(): Promise<QueueMetrics> {
    const processorStats = this.processor.getStats();
    const queueSize = await this.processor.getQueueSize();
    const retryStats = this.retryHandler.getRetryStats();

    // Calculate performance metrics
    const currentWindow = this.performanceWindows[this.performanceWindows.length - 1];
    const hourlyProcessed = this.getHourlyProcessed();
    const minutelyProcessed = this.getMinutelyProcessed();

    const averageProcessingTime = this.calculateAverageProcessingTime();
    const throughputPerMinute = this.calculateThroughput();
    const errorRate = this.calculateErrorRate();
    const rateLimitHitRate = this.calculateRateLimitHitRate();

    // Health assessment
    const { healthStatus, healthIssues } = this.assessHealth(processorStats, queueSize);

    return {
      // Queue status
      queueSize,
      isProcessorRunning: processorStats.isRunning,

      // Processing metrics
      processedToday: this.dailyCounters.processed,
      processedThisHour: hourlyProcessed,
      processedThisMinute: minutelyProcessed,

      // Performance metrics
      averageProcessingTime,
      throughputPerMinute,

      // Error metrics
      totalErrors: this.dailyCounters.errors,
      errorRate,

      // Rate limiting metrics
      rateLimitHits: this.dailyCounters.rateLimitHits,
      rateLimitHitRate,

      // Token bucket status
      tokensAvailable: processorStats.tokenBucketStatus?.tokens || 0,
      tokenCapacity: processorStats.tokenBucketStatus?.capacity || 0,
      refillRate: processorStats.tokenBucketStatus?.refillRate || '0/min',

      // Retry metrics
      totalRetryAttempts: retryStats.totalRetryAttempts,
      averageRetriesPerMessage: retryStats.averageRetriesPerMessage,

      // Timestamps
      lastProcessedAt: processorStats.lastProcessedAt,
      metricsGeneratedAt: new Date().toISOString(),

      // Health status
      healthStatus,
      healthIssues,
    };
  }

  recordProcessingTime(timeMs: number): void {
    this.processingTimes.push(timeMs);

    // Keep only the most recent processing times
    if (this.processingTimes.length > this.maxProcessingTimes) {
      this.processingTimes.shift();
    }
  }

  incrementProcessedCount(): void {
    this.resetDailyCountersIfNeeded();
    this.dailyCounters.processed++;
  }

  incrementErrorCount(): void {
    this.resetDailyCountersIfNeeded();
    this.dailyCounters.errors++;
  }

  incrementRateLimitHits(): void {
    this.resetDailyCountersIfNeeded();
    this.dailyCounters.rateLimitHits++;
  }

  private startMetricsCollection(): void {
    // Collect metrics every minute
    setInterval(() => {
      this.collectPerformanceWindow();
    }, 60000); // 1 minute
  }

  private collectPerformanceWindow(): void {
    const processorStats = this.processor.getStats();

    const window: PerformanceWindow = {
      timestamp: new Date().toISOString(),
      processed: this.getLastMinuteProcessed(),
      errors: this.getLastMinuteErrors(),
      rateLimitHits: this.getLastMinuteRateLimitHits(),
      averageProcessingTime: this.calculateAverageProcessingTime(),
    };

    this.performanceWindows.push(window);

    // Keep only the most recent windows
    if (this.performanceWindows.length > this.maxWindows) {
      this.performanceWindows.shift();
    }
  }

  private getHourlyProcessed(): number {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.performanceWindows
      .filter(window => new Date(window.timestamp) > hourAgo)
      .reduce((sum, window) => sum + window.processed, 0);
  }

  private getMinutelyProcessed(): number {
    const currentWindow = this.performanceWindows[this.performanceWindows.length - 1];
    return currentWindow?.processed || 0;
  }

  private getLastMinuteProcessed(): number {
    // This would be implemented by tracking real-time processing
    // For now, return 0 as placeholder
    return 0;
  }

  private getLastMinuteErrors(): number {
    // This would be implemented by tracking real-time errors
    // For now, return 0 as placeholder
    return 0;
  }

  private getLastMinuteRateLimitHits(): number {
    // This would be implemented by tracking real-time rate limit hits
    // For now, return 0 as placeholder
    return 0;
  }

  private calculateAverageProcessingTime(): number {
    if (this.processingTimes.length === 0) return 0;

    const sum = this.processingTimes.reduce((a, b) => a + b, 0);
    return sum / this.processingTimes.length;
  }

  private calculateThroughput(): number {
    if (this.performanceWindows.length === 0) return 0;

    const recentWindows = this.performanceWindows.slice(-10); // Last 10 minutes
    const totalProcessed = recentWindows.reduce((sum, window) => sum + window.processed, 0);

    return totalProcessed / Math.min(recentWindows.length, 10);
  }

  private calculateErrorRate(): number {
    const totalProcessed = this.dailyCounters.processed;
    const totalErrors = this.dailyCounters.errors;

    if (totalProcessed === 0) return 0;

    return (totalErrors / totalProcessed) * 100;
  }

  private calculateRateLimitHitRate(): number {
    const totalProcessed = this.dailyCounters.processed;
    const rateLimitHits = this.dailyCounters.rateLimitHits;

    if (totalProcessed === 0) return 0;

    return (rateLimitHits / totalProcessed) * 100;
  }

  private assessHealth(processorStats: ProcessorStats, queueSize: number): {
    healthStatus: 'healthy' | 'warning' | 'critical';
    healthIssues: string[];
  } {
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check if processor is running
    if (!processorStats.isRunning) {
      issues.push('Queue processor is not running');
      status = 'critical';
    }

    // Check queue size
    if (queueSize > 10000) {
      issues.push('Queue size is very high (>10k messages)');
      status = status === 'critical' ? 'critical' : 'warning';
    } else if (queueSize > 5000) {
      issues.push('Queue size is high (>5k messages)');
      status = status === 'critical' ? 'critical' : 'warning';
    }

    // Check error rate
    const errorRate = this.calculateErrorRate();
    if (errorRate > 10) {
      issues.push(`High error rate: ${errorRate.toFixed(2)}%`);
      status = status === 'critical' ? 'critical' : 'warning';
    }

    // Check token bucket
    const tokenRatio = processorStats.tokenBucketStatus?.tokens / processorStats.tokenBucketStatus?.capacity;
    if (tokenRatio < 0.1) {
      issues.push('Token bucket is nearly empty');
      status = status === 'critical' ? 'critical' : 'warning';
    }

    // Check processing time
    const avgProcessingTime = this.calculateAverageProcessingTime();
    if (avgProcessingTime > 5000) { // 5 seconds
      issues.push(`High average processing time: ${avgProcessingTime.toFixed(0)}ms`);
      status = status === 'critical' ? 'critical' : 'warning';
    }

    return { healthStatus: status, healthIssues: issues };
  }

  private resetDailyCountersIfNeeded(): void {
    const today = new Date().toDateString();
    if (this.dailyCounters.startOfDay !== today) {
      this.dailyCounters = {
        processed: 0,
        errors: 0,
        rateLimitHits: 0,
        startOfDay: today,
      };
    }
  }

  private scheduleCounterReset(): void {
    // Reset counters at midnight
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.resetDailyCountersIfNeeded();

      // Schedule daily resets
      setInterval(() => {
        this.resetDailyCountersIfNeeded();
      }, 24 * 60 * 60 * 1000); // 24 hours

    }, msUntilMidnight);
  }

  getPerformanceHistory(): PerformanceWindow[] {
    return [...this.performanceWindows];
  }

  resetMetrics(): void {
    this.performanceWindows = [];
    this.processingTimes = [];
    this.dailyCounters = {
      processed: 0,
      errors: 0,
      rateLimitHits: 0,
      startOfDay: new Date().toDateString(),
    };

    this.logger.info('Metrics reset successfully');
  }
}