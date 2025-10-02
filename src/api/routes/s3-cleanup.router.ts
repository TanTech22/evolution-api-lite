import { RequestHandler, Router } from 'express';
import { Logger } from '@config/logger.config';
import { authGuard } from '@api/guards/auth.guard';
import { S3CleanupController } from '@api/controllers/s3-cleanup.controller';

const logger = new Logger('S3CleanupRouter');

export class S3CleanupRouter {
  public readonly router = Router();
  private readonly cleanupController = new S3CleanupController();

  constructor() {
    this.routes();
  }

  private routes() {
    this.router
      .get('/cleanup/schedule', authGuard['apikey'], this.cleanupController.getSchedule as RequestHandler)
      .put('/cleanup/schedule', authGuard['apikey'], this.cleanupController.updateSchedule as RequestHandler)
      .post('/cleanup/execute', authGuard['apikey'], this.cleanupController.manualCleanup as RequestHandler)
      .get('/cleanup/status', authGuard['apikey'], this.cleanupController.getStatus as RequestHandler);

    logger.info('S3 Cleanup routes initialized');
  }
}

export const s3CleanupRouter = new S3CleanupRouter();