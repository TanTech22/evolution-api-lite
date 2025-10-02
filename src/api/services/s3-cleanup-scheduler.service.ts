import { ConfigService, S3 } from '@config/env.config';
import { Logger } from '@config/logger.config';
import * as cron from 'node-cron';
import { cleanupOldAudioFiles } from '@api/integrations/storage/s3/libs/minio.server';

export interface CleanupScheduleConfig {
  enabled: boolean;
  retentionDays: number;
  dailyTime: string; // HH:MM format
  timezone: string;
}

export class S3CleanupSchedulerService {
  private static instance: S3CleanupSchedulerService;
  private logger = new Logger('S3CleanupScheduler');
  private configService = new ConfigService();
  private currentTask: cron.ScheduledTask | null = null;
  private config: CleanupScheduleConfig;

  private constructor() {
    this.initializeDefaultConfig();
  }

  public static getInstance(): S3CleanupSchedulerService {
    if (!S3CleanupSchedulerService.instance) {
      S3CleanupSchedulerService.instance = new S3CleanupSchedulerService();
    }
    return S3CleanupSchedulerService.instance;
  }

  private initializeDefaultConfig(): void {
    const s3Config = this.configService.get<S3>('S3');

    this.config = {
      enabled: s3Config?.CLEANUP_ENABLED || false,
      retentionDays: s3Config?.CLEANUP_DAYS || 1, // Changed from 7 to 1
      dailyTime: '03:00', // Default 3 AM
      timezone: 'America/Sao_Paulo'
    };
  }

  public async initialize(): Promise<void> {
    const s3Config = this.configService.get<S3>('S3');

    if (!s3Config?.ENABLE) {
      this.logger.info('S3 is disabled, cleanup scheduler not initialized');
      return;
    }

    // Try to load config from database, fallback to default
    await this.loadConfigFromDatabase();

    if (this.config.enabled) {
      this.scheduleCleanup();
      this.logger.info(`S3 cleanup scheduler initialized: ${this.config.dailyTime} ${this.config.timezone}, retention: ${this.config.retentionDays} day(s)`);
    } else {
      this.logger.info('S3 cleanup scheduler is disabled');
    }
  }

  private async loadConfigFromDatabase(): Promise<void> {
    // TODO: Load from database when we add the persistence layer
    // For now, use default config
    this.logger.verbose('Using default cleanup configuration');
  }

  private scheduleCleanup(): void {
    // Stop current task if exists
    if (this.currentTask) {
      this.currentTask.stop();
      this.currentTask = null;
    }

    // Parse time
    const [hours, minutes] = this.config.dailyTime.split(':').map(num => parseInt(num, 10));

    // Create cron expression for daily execution
    const cronExpression = `${minutes} ${hours} * * *`; // minute hour * * *

    this.logger.info(`Scheduling cleanup with cron: ${cronExpression} (${this.config.timezone})`);

    this.currentTask = cron.schedule(cronExpression, async () => {
      await this.executeCleanup();
    }, {
      scheduled: true,
      timezone: this.config.timezone
    });
  }

  private async executeCleanup(): Promise<void> {
    try {
      this.logger.info(`Starting scheduled S3 cleanup (retention: ${this.config.retentionDays} day(s))`);

      const result = await cleanupOldAudioFiles(this.config.retentionDays);

      if (result.success) {
        this.logger.info(`S3 cleanup completed successfully: ${result.deletedCount} files deleted, ${result.errorCount} errors`);
      } else {
        this.logger.error(`S3 cleanup failed: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(`S3 cleanup execution error: ${error.message}`);
    }
  }

  public async updateConfig(newConfig: Partial<CleanupScheduleConfig>): Promise<CleanupScheduleConfig> {
    // Validate time format
    if (newConfig.dailyTime) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(newConfig.dailyTime)) {
        throw new Error('Invalid time format. Use HH:MM (24-hour format)');
      }
    }

    // Validate retention days
    if (newConfig.retentionDays !== undefined && (newConfig.retentionDays < 1 || newConfig.retentionDays > 365)) {
      throw new Error('Retention days must be between 1 and 365');
    }

    // Update config
    this.config = { ...this.config, ...newConfig };

    // TODO: Persist to database
    await this.saveConfigToDatabase();

    // Reschedule if enabled
    if (this.config.enabled) {
      this.scheduleCleanup();
      this.logger.info('Cleanup schedule updated and rescheduled');
    } else {
      if (this.currentTask) {
        this.currentTask.stop();
        this.currentTask = null;
      }
      this.logger.info('Cleanup schedule disabled');
    }

    return this.config;
  }

  private async saveConfigToDatabase(): Promise<void> {
    // TODO: Implement database persistence
    this.logger.verbose('Configuration saved (in-memory for now)');
  }

  public getConfig(): CleanupScheduleConfig {
    return { ...this.config };
  }

  public async manualCleanup(): Promise<any> {
    this.logger.info('Manual cleanup triggered');
    return await this.executeCleanup();
  }

  public stop(): void {
    if (this.currentTask) {
      this.currentTask.stop();
      this.currentTask = null;
      this.logger.info('S3 cleanup scheduler stopped');
    }
  }
}

// Export singleton instance
export const s3CleanupScheduler = S3CleanupSchedulerService.getInstance();