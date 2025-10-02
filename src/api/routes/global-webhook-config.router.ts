import { Router } from 'express';
import { Logger } from '@config/logger.config';
import { authGuard } from '@api/guards/auth.guard';
import { GlobalWebhookConfigController } from '@api/controllers/global-webhook-config.controller';
import { prismaRepository } from '@api/server.module';

const logger = new Logger('GlobalWebhookConfigRouter');

export class GlobalWebhookConfigRouter {
  public readonly router = Router();
  private readonly controller = new GlobalWebhookConfigController(prismaRepository);

  constructor() {
    console.log('GlobalWebhookConfigRouter constructor called');
    this.routes();
    console.log('GlobalWebhookConfigRouter routes configured, router stack:', this.router.stack?.length || 0);
  }

  private routes() {
    this.router
      // Get current global webhook configuration
      .get('/config', authGuard['apikey'], this.controller.getConfig.bind(this.controller))

      // Create or update global webhook configuration
      .post('/config', authGuard['apikey'], this.controller.setConfig.bind(this.controller))

      // Update global webhook configuration (same as POST)
      .put('/config', authGuard['apikey'], this.controller.setConfig.bind(this.controller))

      // Disable global webhooks
      .delete('/config', authGuard['apikey'], this.controller.deleteConfig.bind(this.controller))

      // Test webhook connectivity
      .post('/test', authGuard['apikey'], this.controller.testWebhook.bind(this.controller));

    logger.info('Global Webhook Config routes initialized');
  }
}

export const globalWebhookConfigRouter = new GlobalWebhookConfigRouter();