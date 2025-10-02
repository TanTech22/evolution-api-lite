import { Request, Response } from 'express';
import { Logger } from '@config/logger.config';
import { BadRequestException, InternalServerErrorException } from '@exceptions';
import { s3CleanupScheduler, CleanupScheduleConfig } from '@api/services/s3-cleanup-scheduler.service';

const logger = new Logger('S3CleanupController');

export class S3CleanupController {
  public async getSchedule(request: Request, response: Response) {
    try {
      const config = s3CleanupScheduler.getConfig();

      return response.status(200).json({
        success: true,
        data: config
      });
    } catch (error) {
      logger.error(`Error getting cleanup schedule: ${error?.toString()}`);
      throw new InternalServerErrorException(error?.toString());
    }
  }

  public async updateSchedule(request: Request, response: Response) {
    try {
      const updateData: Partial<CleanupScheduleConfig> = request.body;

      // Validate required fields if provided
      if (updateData.enabled !== undefined && typeof updateData.enabled !== 'boolean') {
        throw new BadRequestException('Field "enabled" must be a boolean');
      }

      if (updateData.retentionDays !== undefined) {
        if (!Number.isInteger(updateData.retentionDays) || updateData.retentionDays < 1 || updateData.retentionDays > 365) {
          throw new BadRequestException('Field "retentionDays" must be an integer between 1 and 365');
        }
      }

      if (updateData.dailyTime !== undefined) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(updateData.dailyTime)) {
          throw new BadRequestException('Field "dailyTime" must be in HH:MM format (24-hour)');
        }
      }

      if (updateData.timezone !== undefined && typeof updateData.timezone !== 'string') {
        throw new BadRequestException('Field "timezone" must be a string');
      }

      const updatedConfig = await s3CleanupScheduler.updateConfig(updateData);

      logger.info(`Cleanup schedule updated: ${JSON.stringify(updatedConfig)}`);

      return response.status(200).json({
        success: true,
        message: 'Cleanup schedule updated successfully',
        data: updatedConfig
      });
    } catch (error) {
      logger.error(`Error updating cleanup schedule: ${error?.toString()}`);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(error?.toString());
    }
  }

  public async manualCleanup(request: Request, response: Response) {
    try {
      logger.info('Manual cleanup requested');

      const result = await s3CleanupScheduler.manualCleanup();

      return response.status(200).json({
        success: true,
        message: 'Manual cleanup executed',
        data: result
      });
    } catch (error) {
      logger.error(`Error executing manual cleanup: ${error?.toString()}`);
      throw new InternalServerErrorException(error?.toString());
    }
  }

  public async getStatus(request: Request, response: Response) {
    try {
      const config = s3CleanupScheduler.getConfig();

      const status = {
        enabled: config.enabled,
        nextExecution: config.enabled ? this.getNextExecutionTime(config) : null,
        retentionDays: config.retentionDays,
        dailyTime: config.dailyTime,
        timezone: config.timezone
      };

      return response.status(200).json({
        success: true,
        data: status
      });
    } catch (error) {
      logger.error(`Error getting cleanup status: ${error?.toString()}`);
      throw new InternalServerErrorException(error?.toString());
    }
  }

  private getNextExecutionTime(config: CleanupScheduleConfig): string {
    const [hours, minutes] = config.dailyTime.split(':').map(num => parseInt(num, 10));
    const now = new Date();
    const next = new Date();

    next.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next.toLocaleString('pt-BR', { timeZone: config.timezone });
  }
}