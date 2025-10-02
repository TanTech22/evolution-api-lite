import { Logger } from '../../../config/logger.config';
import { GlobalQueueMessage } from './rabbitmq-queue.service';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
}

export interface RetryAttempt {
  messageId: string;
  attemptNumber: number;
  timestamp: string;
  error: string;
  nextRetryAt: string;
}

export class RetryHandler {
  private readonly logger = new Logger('RetryHandler');
  private readonly retryAttempts = new Map<string, RetryAttempt[]>();
  private readonly defaultConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 300000, // 5 minutes
    backoffMultiplier: 2,
  };

  constructor(private config: RetryConfig = {}) {
    this.config = { ...this.defaultConfig, ...config };
  }

  shouldRetry(messageId: string, error: Error): boolean {
    const attempts = this.retryAttempts.get(messageId) || [];
    const attemptCount = attempts.length;

    if (attemptCount >= this.config.maxRetries) {
      this.logger.warn(`Message ${messageId} exceeded max retries (${this.config.maxRetries})`);
      return false;
    }

    // Don't retry certain types of errors
    if (this.isNonRetryableError(error)) {
      this.logger.warn(`Message ${messageId} has non-retryable error: ${error.message}`);
      return false;
    }

    return true;
  }

  recordFailure(messageId: string, error: Error): RetryAttempt {
    const attempts = this.retryAttempts.get(messageId) || [];
    const attemptNumber = attempts.length + 1;
    const delay = this.calculateDelay(attemptNumber);
    const nextRetryAt = new Date(Date.now() + delay).toISOString();

    const attempt: RetryAttempt = {
      messageId,
      attemptNumber,
      timestamp: new Date().toISOString(),
      error: error.message,
      nextRetryAt,
    };

    attempts.push(attempt);
    this.retryAttempts.set(messageId, attempts);

    this.logger.debug(`Recorded failure for message ${messageId}, attempt ${attemptNumber}, next retry at ${nextRetryAt}`);

    return attempt;
  }

  getRetryDelay(messageId: string): number {
    const attempts = this.retryAttempts.get(messageId) || [];
    const attemptNumber = attempts.length + 1;
    return this.calculateDelay(attemptNumber);
  }

  getRetryAttempts(messageId: string): RetryAttempt[] {
    return this.retryAttempts.get(messageId) || [];
  }

  clearRetryHistory(messageId: string): void {
    this.retryAttempts.delete(messageId);
  }

  markAsSuccessful(messageId: string): void {
    const attempts = this.retryAttempts.get(messageId);
    if (attempts && attempts.length > 0) {
      this.logger.info(`Message ${messageId} succeeded after ${attempts.length} retry attempts`);
    }
    this.clearRetryHistory(messageId);
  }

  getRetryStats(): {
    totalMessagesWithRetries: number;
    totalRetryAttempts: number;
    averageRetriesPerMessage: number;
    messagesByRetryCount: Map<number, number>;
  } {
    const messagesByRetryCount = new Map<number, number>();
    let totalRetryAttempts = 0;

    for (const [, attempts] of this.retryAttempts) {
      const retryCount = attempts.length;
      totalRetryAttempts += retryCount;
      messagesByRetryCount.set(retryCount, (messagesByRetryCount.get(retryCount) || 0) + 1);
    }

    const totalMessagesWithRetries = this.retryAttempts.size;
    const averageRetriesPerMessage = totalMessagesWithRetries > 0
      ? totalRetryAttempts / totalMessagesWithRetries
      : 0;

    return {
      totalMessagesWithRetries,
      totalRetryAttempts,
      averageRetriesPerMessage,
      messagesByRetryCount,
    };
  }

  private calculateDelay(attemptNumber: number): number {
    const delay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attemptNumber - 1);
    return Math.min(delay, this.config.maxDelay);
  }

  private isNonRetryableError(error: Error): boolean {
    const nonRetryableErrors = [
      'AUTHENTICATION_FAILED',
      'INVALID_WEBHOOK_URL',
      'MALFORMED_MESSAGE',
      'PERMISSION_DENIED',
      'INVALID_INSTANCE',
    ];

    return nonRetryableErrors.some(pattern =>
      error.message.toUpperCase().includes(pattern)
    );
  }

  // Cleanup old retry attempts (call periodically)
  cleanupOldAttempts(maxAgeMs: number = 24 * 60 * 60 * 1000): void { // 24 hours default
    const cutoffTime = Date.now() - maxAgeMs;
    const messagesToRemove: string[] = [];

    for (const [messageId, attempts] of this.retryAttempts) {
      const lastAttempt = attempts[attempts.length - 1];
      const lastAttemptTime = new Date(lastAttempt.timestamp).getTime();

      if (lastAttemptTime < cutoffTime) {
        messagesToRemove.push(messageId);
      }
    }

    messagesToRemove.forEach(messageId => {
      this.retryAttempts.delete(messageId);
    });

    if (messagesToRemove.length > 0) {
      this.logger.info(`Cleaned up ${messagesToRemove.length} old retry attempts`);
    }
  }
}