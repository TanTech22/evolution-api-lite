import { Request, Response } from 'express';
import { Logger } from '@config/logger.config';
import { BadRequestException, InternalServerErrorException } from '@exceptions';
import { PrismaRepository } from '@api/repository/repository.service';
import { isURL } from 'class-validator';

const logger = new Logger('GlobalWebhookConfigController');

export interface GlobalWebhookConfigRequest {
  principal?: {
    enabled: boolean;
    url?: string;
  };
  monitoramento?: {
    enabled: boolean;
    url?: string;
  };
  webhookByEvents?: boolean;
  headers?: Record<string, string>;
}

export class GlobalWebhookConfigController {
  constructor(private readonly prisma: PrismaRepository) {}

  /**
   * Get current global webhook configuration
   * GET /webhook/global/config
   */
  public async getConfig(request: Request, response: Response) {
    try {
      const config = await this.prisma.globalWebhookConfig.findFirst({
        orderBy: { id: 'desc' }
      });

      if (!config) {
        return response.status(200).json({
          success: true,
          data: {
            principal: {
              enabled: false,
              url: null
            },
            monitoramento: {
              enabled: false,
              url: null
            },
            webhookByEvents: false,
            headers: null,
            createdAt: null,
            updatedAt: null
          }
        });
      }

      return response.status(200).json({
        success: true,
        data: {
          principal: {
            enabled: config.webhookPrincipalEnabled,
            url: config.webhookPrincipalUrl
          },
          monitoramento: {
            enabled: config.webhookSecundarioEnabled,
            url: config.webhookSecundarioUrl
          },
          webhookByEvents: config.webhookByEvents,
          headers: config.headers ? JSON.parse(config.headers) : null,
          createdAt: config.createdAt,
          updatedAt: config.updatedAt
        }
      });

    } catch (error) {
      logger.error(`Error getting webhook config: ${error?.toString()}`);
      throw new InternalServerErrorException(error?.toString());
    }
  }

  /**
   * Create or update global webhook configuration
   * POST /webhook/global/config
   * PUT /webhook/global/config
   */
  public async setConfig(request: Request, response: Response) {
    try {
      const data: GlobalWebhookConfigRequest = request.body;

      // Validate URLs if provided
      if (data.principal?.url && !isURL(data.principal.url, { require_tld: false })) {
        throw new BadRequestException('Invalid principal webhook URL');
      }

      if (data.monitoramento?.url && !isURL(data.monitoramento.url, { require_tld: false })) {
        throw new BadRequestException('Invalid monitoring webhook URL');
      }

      // Check if at least one webhook is being configured
      if (!data.principal && !data.monitoramento) {
        throw new BadRequestException('At least one webhook configuration (principal or monitoramento) is required');
      }

      // Get current config to merge with new data
      const currentConfig = await this.prisma.globalWebhookConfig.findFirst({
        orderBy: { id: 'desc' }
      });

      const configData = {
        webhookPrincipalEnabled: data.principal?.enabled ?? currentConfig?.webhookPrincipalEnabled ?? false,
        webhookPrincipalUrl: data.principal?.url ?? currentConfig?.webhookPrincipalUrl,
        webhookSecundarioEnabled: data.monitoramento?.enabled ?? currentConfig?.webhookSecundarioEnabled ?? false,
        webhookSecundarioUrl: data.monitoramento?.url ?? currentConfig?.webhookSecundarioUrl,
        webhookByEvents: data.webhookByEvents ?? currentConfig?.webhookByEvents ?? false,
        headers: data.headers ? JSON.stringify(data.headers) : currentConfig?.headers
      };

      // Delete old configs and create new one (since we want only the latest)
      await this.prisma.globalWebhookConfig.deleteMany({});

      const config = await this.prisma.globalWebhookConfig.create({
        data: configData
      });

      logger.info(`Global webhook config updated: principal=${config.webhookPrincipalEnabled}, monitoring=${config.webhookSecundarioEnabled}`);

      return response.status(200).json({
        success: true,
        message: 'Global webhook configuration updated successfully',
        data: {
          principal: {
            enabled: config.webhookPrincipalEnabled,
            url: config.webhookPrincipalUrl
          },
          monitoramento: {
            enabled: config.webhookSecundarioEnabled,
            url: config.webhookSecundarioUrl
          },
          webhookByEvents: config.webhookByEvents,
          headers: config.headers ? JSON.parse(config.headers) : null,
          createdAt: config.createdAt,
          updatedAt: config.updatedAt
        }
      });

    } catch (error) {
      logger.error(`Error setting webhook config: ${error?.toString()}`);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(error?.toString());
    }
  }

  /**
   * Disable global webhooks
   * DELETE /webhook/global/config
   */
  public async deleteConfig(request: Request, response: Response) {
    try {
      // Set all webhooks to disabled instead of deleting the record
      const currentConfig = await this.prisma.globalWebhookConfig.findFirst({
        orderBy: { id: 'desc' }
      });

      if (!currentConfig) {
        return response.status(200).json({
          success: true,
          message: 'No webhook configuration found to disable'
        });
      }

      await this.prisma.globalWebhookConfig.deleteMany({});

      const disabledConfig = await this.prisma.globalWebhookConfig.create({
        data: {
          webhookPrincipalEnabled: false,
          webhookPrincipalUrl: currentConfig.webhookPrincipalUrl,
          webhookSecundarioEnabled: false,
          webhookSecundarioUrl: currentConfig.webhookSecundarioUrl,
          webhookByEvents: currentConfig.webhookByEvents,
          headers: currentConfig.headers
        }
      });

      logger.info('Global webhook configuration disabled');

      return response.status(200).json({
        success: true,
        message: 'Global webhook configuration disabled successfully',
        data: {
          principal: {
            enabled: false,
            url: disabledConfig.webhookPrincipalUrl
          },
          monitoramento: {
            enabled: false,
            url: disabledConfig.webhookSecundarioUrl
          },
          webhookByEvents: disabledConfig.webhookByEvents,
          headers: disabledConfig.headers,
          disabledAt: disabledConfig.updatedAt
        }
      });

    } catch (error) {
      logger.error(`Error disabling webhook config: ${error?.toString()}`);
      throw new InternalServerErrorException(error?.toString());
    }
  }

  /**
   * Test webhook connectivity
   * POST /webhook/global/test
   */
  public async testWebhook(request: Request, response: Response) {
    try {
      const { url, type = 'principal' } = request.body;

      if (!url) {
        throw new BadRequestException('URL is required for testing');
      }

      if (!isURL(url, { require_tld: false })) {
        throw new BadRequestException('Invalid URL format');
      }

      const testPayload = {
        event: 'webhook.test',
        instance: 'test',
        data: {
          message: 'Test webhook connectivity',
          timestamp: new Date().toISOString(),
          type: type
        },
        server_url: request.protocol + '://' + request.get('host'),
        test: true
      };

      const startTime = Date.now();

      try {
        const fetch = (await import('node-fetch')).default;
        const response_data = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Evolution-API-WebhookTest/1.0'
          },
          body: JSON.stringify(testPayload),
          timeout: 10000 // 10 seconds
        });

        const responseTime = Date.now() - startTime;

        return response.status(200).json({
          success: true,
          data: {
            url,
            success: response_data.ok,
            statusCode: response_data.status,
            statusText: response_data.statusText,
            responseTime: `${responseTime}ms`,
            headers: Object.fromEntries(response_data.headers.entries()),
            testedAt: new Date().toISOString()
          }
        });

      } catch (networkError) {
        const responseTime = Date.now() - startTime;

        return response.status(200).json({
          success: false,
          data: {
            url,
            success: false,
            error: networkError.message,
            responseTime: `${responseTime}ms`,
            testedAt: new Date().toISOString()
          }
        });
      }

    } catch (error) {
      logger.error(`Error testing webhook: ${error?.toString()}`);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(error?.toString());
    }
  }
}