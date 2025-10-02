import { authGuard } from '@api/guards/auth.guard';
import { instanceExistsGuard, instanceLoggedGuard } from '@api/guards/instance.guard';
import Telemetry from '@api/guards/telemetry.guard';
import { ChannelRouter } from '@api/integrations/channel/channel.router';
import { EventRouter } from '@api/integrations/event/event.router';
import { StorageRouter } from '@api/integrations/storage/storage.router';
import { instanceController } from '@api/server.module';
import { configService } from '@config/env.config';
import { Router } from 'express';
import fs from 'fs';

import { CallRouter } from './call.router';
import { ChatRouter } from './chat.router';
import { GroupRouter } from './group.router';
import { InstanceRouter } from './instance.router';
import { LabelRouter } from './label.router';
import { ProxyRouter } from './proxy.router';
import { MessageRouter } from './sendMessage.router';
import { SettingsRouter } from './settings.router';
import { TemplateRouter } from './template.router';
import { WebhookMonitoringRouter } from './webhook-monitoring.router';
import { s3CleanupRouter } from './s3-cleanup.router';
import { processingFeedbackRouter } from './processing-feedback.router';
import { globalWebhookConfigRouter } from './global-webhook-config.router';

enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NOT_FOUND = 404,
  FORBIDDEN = 403,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  INTERNAL_SERVER_ERROR = 500,
}

const router: Router = Router();
const serverConfig = configService.get('SERVER');
const guards = [instanceExistsGuard, instanceLoggedGuard, authGuard['apikey']];

const telemetry = new Telemetry();

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

router
  .use((req, res, next) => telemetry.collectTelemetry(req, res, next))

  .get('/', (req, res) => {
    res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'Welcome to the Evolution API, it is working!',
      version: packageJson.version,
      clientName: process.env.DATABASE_CONNECTION_CLIENT_NAME,
      manager: !serverConfig.DISABLE_MANAGER ? `${req.protocol}://${req.get('host')}/manager` : undefined,
      dashboard: `${req.protocol}://${req.get('host')}/dashboard`,
      qrScreen: `${req.protocol}://${req.get('host')}/qr-screen`, // QR Code Scanner interface
      documentation: `https://doc.evolution-api.com`,
    });
  })
  .get('/dashboard', (req, res) => {
    res.sendFile('dashboard.html', { root: './public' });
  })
  .get('/qr-screen', (req, res) => {
    res.sendFile('qr-screen.html', { root: './public' });
  })
  .post('/verify-creds', authGuard['apikey'], async (req, res) => {
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'Credentials are valid',
      facebookAppId: process.env.FACEBOOK_APP_ID,
      facebookConfigId: process.env.FACEBOOK_CONFIG_ID,
      facebookUserToken: process.env.FACEBOOK_USER_TOKEN,
    });
  })
  .get('/queue/stats', authGuard['apikey'], async (req, res) => {
    const response = await instanceController.getGlobalQueueStats();
    return res.status(HttpStatus.OK).json(response);
  })
  .get('/queue/metrics', authGuard['apikey'], async (req, res) => {
    const response = await instanceController.getGlobalQueueMetrics();
    return res.status(HttpStatus.OK).json(response);
  })
  .post('/queue/metrics/reset', authGuard['apikey'], async (req, res) => {
    const response = await instanceController.resetGlobalQueueMetrics();
    return res.status(HttpStatus.OK).json(response);
  })
  .use('/instance', new InstanceRouter(configService, ...guards).router)
  .use('/message', new MessageRouter(...guards).router)
  .use('/call', new CallRouter(...guards).router)
  .use('/chat', new ChatRouter(...guards).router)
  .use('/group', new GroupRouter(...guards).router)
  .use('/template', new TemplateRouter(configService, ...guards).router)
  .use('/settings', new SettingsRouter(...guards).router)
  .use('/proxy', new ProxyRouter(...guards).router)
  .use('/label', new LabelRouter(...guards).router)
  .use('', s3CleanupRouter.router)
  .use('', (() => {
    console.log('Mounting processing feedback router...');
    return processingFeedbackRouter.router;
  })())
  .use('/webhook/global', (() => {
    console.log('Mounting global webhook config router...');
    return globalWebhookConfigRouter.router;
  })())
  .use('/webhook', new WebhookMonitoringRouter(configService, authGuard['apikey']).router)
  .use('', new ChannelRouter(configService, ...guards).router)
  .use('', new EventRouter(configService, ...guards).router)
  .use('', new StorageRouter(...guards).router);

export { HttpStatus, router };
