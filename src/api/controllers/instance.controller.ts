import { InstanceDto, SetPresenceDto } from '@api/dto/instance.dto';
import { ProviderFiles } from '@api/provider/sessions';
import { PrismaRepository } from '@api/repository/repository.service';
import { channelController, eventManager } from '@api/server.module';
import { CacheService } from '@api/services/cache.service';
import { GlobalQueueService } from '@api/services/global-queue.service';
import { WAMonitoringService } from '@api/services/monitor.service';
import { SettingsService } from '@api/services/settings.service';
import { AudioFilterStatsService } from '@api/services/audio-filter-stats.service';
import { Events, Integration, wa } from '@api/types/wa.types';
import { Auth, Chatwoot, ConfigService, GlobalQueue, HttpServer, WaBusiness } from '@config/env.config';
import { Logger } from '@config/logger.config';
import { BadRequestException, InternalServerErrorException, UnauthorizedException } from '@exceptions';
import { delay } from 'baileys';
import { isArray } from 'class-validator';
import EventEmitter2 from 'eventemitter2';
import { v4 } from 'uuid';

import { ProxyController } from './proxy.controller';

export class InstanceController {
  private globalQueueService: GlobalQueueService;

  constructor(
    private readonly waMonitor: WAMonitoringService,
    private readonly configService: ConfigService,
    private readonly prismaRepository: PrismaRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly settingsService: SettingsService,
    private readonly proxyService: ProxyController,
    private readonly cache: CacheService,
    private readonly baileysCache: CacheService,
    private readonly providerFiles: ProviderFiles,
  ) {
    const queueConfig = this.configService.get<GlobalQueue>('GLOBAL_QUEUE');
    const tokenBucketConfig = {
      capacity: queueConfig.TOKEN_BUCKET.CAPACITY,
      refillRate: queueConfig.TOKEN_BUCKET.REFILL_RATE,
      refillInterval: queueConfig.TOKEN_BUCKET.REFILL_INTERVAL,
    };
    this.globalQueueService = new GlobalQueueService(tokenBucketConfig);
  }

  private readonly logger = new Logger('InstanceController');

  public async createInstance(instanceData: InstanceDto) {
    try {
      const instance = channelController.init(instanceData, {
        configService: this.configService,
        eventEmitter: this.eventEmitter,
        prismaRepository: this.prismaRepository,
        cache: this.cache,
        baileysCache: this.baileysCache,
        providerFiles: this.providerFiles,
      });

      if (!instance) {
        throw new BadRequestException('Invalid integration');
      }

      const instanceId = v4();

      instanceData.instanceId = instanceId;

      let hash: string;

      if (!instanceData.token) hash = v4().toUpperCase();
      else hash = instanceData.token;

      await this.waMonitor.saveInstance({
        instanceId,
        integration: instanceData.integration,
        instanceName: instanceData.instanceName,
        ownerJid: instanceData.ownerJid,
        profileName: instanceData.profileName,
        profilePicUrl: instanceData.profilePicUrl,
        hash,
        number: instanceData.number,
        businessId: instanceData.businessId,
        status: instanceData.status,
        audioFilters: instanceData.audioFilters,
      });

      instance.setInstance({
        instanceName: instanceData.instanceName,
        instanceId,
        integration: instanceData.integration,
        token: hash,
        number: instanceData.number,
        businessId: instanceData.businessId,
      });

      this.waMonitor.waInstances[instance.instanceName] = instance;
      this.waMonitor.delInstanceTime(instance.instanceName);

      // set events
      await eventManager.setInstance(instance.instanceName, instanceData);

      instance.sendDataWebhook(Events.INSTANCE_CREATE, {
        instanceName: instanceData.instanceName,
        instanceId: instanceId,
      });

      if (instanceData.proxyHost && instanceData.proxyPort && instanceData.proxyProtocol) {
        const testProxy = await this.proxyService.testProxy({
          host: instanceData.proxyHost,
          port: instanceData.proxyPort,
          protocol: instanceData.proxyProtocol,
          username: instanceData.proxyUsername,
          password: instanceData.proxyPassword,
        });
        if (!testProxy) {
          throw new BadRequestException('Invalid proxy');
        }

        await this.proxyService.createProxy(instance, {
          enabled: true,
          host: instanceData.proxyHost,
          port: instanceData.proxyPort,
          protocol: instanceData.proxyProtocol,
          username: instanceData.proxyUsername,
          password: instanceData.proxyPassword,
        });
      }

      const settings: wa.LocalSettings = {
        rejectCall: instanceData.rejectCall === true,
        msgCall: instanceData.msgCall || '',
        groupsIgnore: instanceData.groupsIgnore === true,
        alwaysOnline: instanceData.alwaysOnline === true,
        readMessages: instanceData.readMessages === true ? true : false,
        readStatus: instanceData.readStatus === true ? true : false,
        syncFullHistory: instanceData.syncFullHistory === true ? true : false,
        wavoipToken: instanceData.wavoipToken || '',
      };

      await this.settingsService.create(instance, settings);

      let webhookWaBusiness = null,
        accessTokenWaBusiness = '';

      if (instanceData.integration === Integration.WHATSAPP_BUSINESS) {
        if (!instanceData.number) {
          throw new BadRequestException('number is required');
        }
        const urlServer = this.configService.get<HttpServer>('SERVER').URL;
        webhookWaBusiness = `${urlServer}/webhook/meta`;
        accessTokenWaBusiness = this.configService.get<WaBusiness>('WA_BUSINESS').TOKEN_WEBHOOK;
      }

      let getQrcode: wa.QrCode;

      if (instanceData.qrcode && instanceData.integration === Integration.WHATSAPP_BAILEYS) {
        await instance.connectToWhatsapp(instanceData.number);
        await delay(5000);
        getQrcode = instance.qrCode;
      }

      const result = {
        instance: {
          instanceName: instance.instanceName,
          instanceId: instanceId,
          integration: instanceData.integration,
          webhookWaBusiness,
          accessTokenWaBusiness,
          status: instance.connectionStatus.state,
        },
        hash,
        webhook: {
          webhookUrl: instanceData?.webhook?.url,
          webhookHeaders: instanceData?.webhook?.headers,
          webhookByEvents: instanceData?.webhook?.byEvents,
          webhookBase64: instanceData?.webhook?.base64,
        },
        websocket: {
          enabled: instanceData?.websocket?.enabled,
        },
        rabbitmq: {
          enabled: instanceData?.rabbitmq?.enabled,
        },
        sqs: {
          enabled: instanceData?.sqs?.enabled,
        },
        settings,
        qrcode: getQrcode,
      };

      return result;
    } catch (error) {
      this.waMonitor.deleteInstance(instanceData.instanceName);
      this.logger.error(isArray(error.message) ? error.message[0] : error.message);
      throw new BadRequestException(isArray(error.message) ? error.message[0] : error.message);
    }
  }

  public async connectToWhatsapp({ instanceName, number = null }: InstanceDto) {
    try {
      const instance = this.waMonitor.waInstances[instanceName];
      const state = instance?.connectionStatus?.state;

      if (!state) {
        throw new BadRequestException('The "' + instanceName + '" instance does not exist');
      }

      if (state == 'open') {
        return await this.connectionState({ instanceName });
      }

      if (state == 'connecting') {
        const qrData = instance.qrCode;
        return {
          response: {
            instance: instanceName,
            pairingCode: qrData?.pairingCode,
            code: qrData?.code,
            base64: qrData?.base64,
            count: qrData?.count
          }
        };
      }

      if (state == 'close') {
        await instance.connectToWhatsapp(number);

        await delay(2000);
        const qrData = instance.qrCode;
        return {
          response: {
            instance: instanceName,
            pairingCode: qrData?.pairingCode,
            code: qrData?.code,
            base64: qrData?.base64,
            count: qrData?.count
          }
        };
      }

      const qrData = instance?.qrCode;
      return {
        response: {
          instance: instanceName,
          status: state,
          pairingCode: qrData?.pairingCode,
          code: qrData?.code,
          base64: qrData?.base64,
          count: qrData?.count
        }
      };
    } catch (error) {
      this.logger.error(error);
      return { error: true, message: error.toString() };
    }
  }

  public async restartInstance({ instanceName }: InstanceDto) {
    try {
      const instance = this.waMonitor.waInstances[instanceName];
      const state = instance?.connectionStatus?.state;

      if (!state) {
        throw new BadRequestException('The "' + instanceName + '" instance does not exist');
      }

      if (state == 'close') {
        throw new BadRequestException('The "' + instanceName + '" instance is not connected');
      } else if (state == 'open') {
        if (this.configService.get<Chatwoot>('CHATWOOT').ENABLED) instance.clearCacheChatwoot();
        this.logger.info('restarting instance' + instanceName);

        instance.client?.ws?.close();
        instance.client?.end(new Error('restart'));
        return await this.connectToWhatsapp({ instanceName });
      } else if (state == 'connecting') {
        instance.client?.ws?.close();
        instance.client?.end(new Error('restart'));
        return await this.connectToWhatsapp({ instanceName });
      }
    } catch (error) {
      this.logger.error(error);
      return { error: true, message: error.toString() };
    }
  }

  public async connectionState({ instanceName }: InstanceDto) {
    return {
      instance: {
        instanceName: instanceName,
        state: this.waMonitor.waInstances[instanceName]?.connectionStatus?.state,
      },
    };
  }

  public async fetchInstances({ instanceName, instanceId, number }: InstanceDto, key: string) {
    const env = this.configService.get<Auth>('AUTHENTICATION').API_KEY;

    if (env.KEY !== key) {
      const instancesByKey = await this.prismaRepository.instance.findMany({
        where: {
          token: key,
          name: instanceName || undefined,
          id: instanceId || undefined,
        },
      });

      if (instancesByKey.length > 0) {
        const names = instancesByKey.map((instance) => instance.name);

        return this.waMonitor.instanceInfo(names);
      } else {
        throw new UnauthorizedException();
      }
    }

    if (instanceId || number) {
      return this.waMonitor.instanceInfoById(instanceId, number);
    }

    const instanceNames = instanceName ? [instanceName] : null;

    return this.waMonitor.instanceInfo(instanceNames);
  }

  public async setPresence({ instanceName }: InstanceDto, data: SetPresenceDto) {
    return await this.waMonitor.waInstances[instanceName].setPresence(data);
  }

  public async logout({ instanceName }: InstanceDto) {
    const { instance } = await this.connectionState({ instanceName });

    if (instance.state === 'close') {
      throw new BadRequestException('The "' + instanceName + '" instance is not connected');
    }

    try {
      this.waMonitor.waInstances[instanceName]?.logoutInstance();

      return { status: 'SUCCESS', error: false, response: { message: 'Instance logged out' } };
    } catch (error) {
      throw new InternalServerErrorException(error.toString());
    }
  }

  public async deleteInstance({ instanceName }: InstanceDto) {
    const { instance } = await this.connectionState({ instanceName });
    try {
      const waInstances = this.waMonitor.waInstances[instanceName];
      if (this.configService.get<Chatwoot>('CHATWOOT').ENABLED) waInstances?.clearCacheChatwoot();

      if (instance.state === 'connecting' || instance.state === 'open') {
        await this.logout({ instanceName });
      }

      try {
        waInstances?.sendDataWebhook(Events.INSTANCE_DELETE, {
          instanceName,
          instanceId: waInstances.instanceId,
        });
      } catch (error) {
        this.logger.error(error);
      }

      this.eventEmitter.emit('remove.instance', instanceName, 'inner');
      return { status: 'SUCCESS', error: false, response: { message: 'Instance deleted' } };
    } catch (error) {
      throw new BadRequestException(error.toString());
    }
  }

  public async duplicateInstance(sourceInstanceName: string, newInstanceName: string) {
    try {
      // Verifica se instância origem existe
      const sourceInstance = this.waMonitor.waInstances[sourceInstanceName];
      if (!sourceInstance) {
        throw new BadRequestException(`Source instance "${sourceInstanceName}" not found`);
      }

      // Verifica se nova instância já existe
      if (this.waMonitor.waInstances[newInstanceName]) {
        throw new BadRequestException(`Instance "${newInstanceName}" already exists`);
      }

      // Busca configurações da instância origem no banco
      const sourceDbInstance = await this.prismaRepository.instance.findFirst({
        where: { name: sourceInstanceName },
        include: {
          Webhook: true,
          Websocket: true,
          Rabbitmq: true,
          Sqs: true,
          Pusher: true,
        }
      });

      if (!sourceDbInstance) {
        throw new BadRequestException(`Source instance "${sourceInstanceName}" not found in database`);
      }

      this.logger.log(`Duplicating instance ${sourceInstanceName} to ${newInstanceName}`);

      // Cria nova instância com as mesmas configurações
      const newInstanceData: InstanceDto = {
        instanceName: newInstanceName,
        integration: sourceDbInstance.integration as string,
        token: sourceDbInstance.token || undefined,
        number: undefined, // Será definido quando conectar
        qrcode: false,
        webhook: sourceDbInstance.Webhook ? {
          enabled: sourceDbInstance.Webhook.enabled,
          url: sourceDbInstance.Webhook.url,
          events: sourceDbInstance.Webhook.events as string[],
          headers: sourceDbInstance.Webhook.headers,
          byEvents: sourceDbInstance.Webhook.webhookByEvents,
          base64: sourceDbInstance.Webhook.webhookBase64,
          // messageTypes: sourceDbInstance.Webhook.messageTypes as string[],
          // excludeMessageTypes: sourceDbInstance.Webhook.excludeMessageTypes as string[],
          // textFilters: sourceDbInstance.Webhook.textFilters,
          // audioProcessing: sourceDbInstance.Webhook.audioProcessing,
        } : undefined,
        websocket: sourceDbInstance.Websocket ? {
          enabled: sourceDbInstance.Websocket.enabled,
          events: sourceDbInstance.Websocket.events as string[],
          // messageTypes: sourceDbInstance.Websocket.messageTypes as string[],
          // excludeMessageTypes: sourceDbInstance.Websocket.excludeMessageTypes as string[],
          // textFilters: sourceDbInstance.Websocket.textFilters,
          // audioProcessing: sourceDbInstance.Websocket.audioProcessing,
        } : undefined,
        rabbitmq: sourceDbInstance.Rabbitmq ? {
          enabled: sourceDbInstance.Rabbitmq.enabled,
          events: sourceDbInstance.Rabbitmq.events as string[],
          // messageTypes: sourceDbInstance.Rabbitmq.messageTypes as string[],
          // excludeMessageTypes: sourceDbInstance.Rabbitmq.excludeMessageTypes as string[],
          // textFilters: sourceDbInstance.Rabbitmq.textFilters,
          // audioProcessing: sourceDbInstance.Rabbitmq.audioProcessing,
        } : undefined,
        sqs: sourceDbInstance.Sqs ? {
          enabled: sourceDbInstance.Sqs.enabled,
          events: sourceDbInstance.Sqs.events as string[],
          // messageTypes: sourceDbInstance.Sqs.messageTypes as string[],
          // excludeMessageTypes: sourceDbInstance.Sqs.excludeMessageTypes as string[],
          // textFilters: sourceDbInstance.Sqs.textFilters,
          // audioProcessing: sourceDbInstance.Sqs.audioProcessing,
        } : undefined,
        pusher: sourceDbInstance.Pusher ? {
          enabled: sourceDbInstance.Pusher.enabled,
          events: sourceDbInstance.Pusher.events as string[],
          appId: sourceDbInstance.Pusher.appId,
          key: sourceDbInstance.Pusher.key,
          secret: sourceDbInstance.Pusher.secret,
          cluster: sourceDbInstance.Pusher.cluster,
          useTLS: sourceDbInstance.Pusher.useTLS,
          // messageTypes: sourceDbInstance.Pusher.messageTypes as string[],
          // excludeMessageTypes: sourceDbInstance.Pusher.excludeMessageTypes as string[],
          // textFilters: sourceDbInstance.Pusher.textFilters,
          // audioProcessing: sourceDbInstance.Pusher.audioProcessing,
        } : undefined,
      };

      // Cria a nova instância
      const result = await this.createInstance(newInstanceData);

      this.logger.log(`Instance duplicated successfully: ${sourceInstanceName} -> ${newInstanceName}`);

      return {
        status: 'SUCCESS',
        error: false,
        response: {
          message: `Instance "${newInstanceName}" created as copy of "${sourceInstanceName}"`,
          sourceInstance: sourceInstanceName,
          newInstance: newInstanceName,
          instanceData: result
        }
      };

    } catch (error) {
      this.logger.error(`Error duplicating instance: ${error.message}`);
      throw new BadRequestException(error.toString());
    }
  }

  public async getInstanceMetrics({ instanceName }: InstanceDto) {
    try {
      const instance = this.waMonitor.waInstances[instanceName];
      if (!instance) {
        throw new BadRequestException(`Instance "${instanceName}" not found`);
      }

      // Obtém informações básicas da instância
      const connectionInfo = instance.connectionStatus;
      const qrCodeInfo = instance.qrCode;

      // Obtém estatísticas do processo (aproximadas)
      const processInfo = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      // Busca métricas do banco de dados
      const dbMetrics = await this.getInstanceDbMetrics(instance.instanceId);

      // Informações da conexão
      const connectionMetrics = {
        state: connectionInfo?.state || 'unknown',
        isConnected: connectionInfo?.state === 'open',
        lastDisconnect: connectionInfo?.lastDisconnect,
        qrCode: {
          hasQrCode: !!qrCodeInfo?.code,
          count: qrCodeInfo?.count || 0,
          pairingCode: qrCodeInfo?.pairingCode
        }
      };

      // Métricas de performance (estimativas por instância)
      const performanceMetrics = {
        memoryUsage: {
          rss: Math.round(processInfo.rss / 1024 / 1024), // MB
          heapUsed: Math.round(processInfo.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(processInfo.heapTotal / 1024 / 1024), // MB
          external: Math.round(processInfo.external / 1024 / 1024), // MB
        },
        cpuUsage: {
          user: cpuUsage.user,
          system: cpuUsage.system
        },
        uptime: Math.round(process.uptime()), // segundos
      };

      return {
        status: 'SUCCESS',
        error: false,
        response: {
          instanceName,
          instanceId: instance.instanceId,
          connection: connectionMetrics,
          performance: performanceMetrics,
          database: dbMetrics,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      this.logger.error(`Error getting instance metrics: ${error.message}`);
      throw new BadRequestException(error.toString());
    }
  }

  private async getInstanceDbMetrics(instanceId: string) {
    try {
      const [
        messageCount,
        contactCount,
        chatCount,
        mediaCount
      ] = await Promise.all([
        this.prismaRepository.message.count({ where: { instanceId } }),
        this.prismaRepository.contact.count({ where: { instanceId } }),
        this.prismaRepository.chat.count({ where: { instanceId } }),
        this.prismaRepository.media?.count({ where: { instanceId } }) || 0
      ]);

      // Últimas atividades
      const [lastMessage, lastContact] = await Promise.all([
        this.prismaRepository.message.findFirst({
          where: { instanceId },
          orderBy: { messageTimestamp: 'desc' },
          select: { messageTimestamp: true, key: true }
        }),
        this.prismaRepository.contact.findFirst({
          where: { instanceId },
          orderBy: { id: 'desc' },
          select: { pushName: true, remoteJid: true }
        })
      ]);

      return {
        counts: {
          messages: messageCount,
          contacts: contactCount,
          chats: chatCount,
          media: mediaCount
        },
        lastActivity: {
          lastMessage: lastMessage ? {
            timestamp: lastMessage.messageTimestamp,
            remoteJid: (lastMessage.key as any)?.remoteJid || null
          } : null,
          lastContact: lastContact ? {
            name: lastContact.pushName,
            remoteJid: lastContact.remoteJid
          } : null
        }
      };

    } catch (error) {
      this.logger.error(`Error getting DB metrics: ${error.message}`);
      return {
        counts: { messages: 0, contacts: 0, chats: 0, media: 0 },
        lastActivity: { lastMessage: null, lastContact: null },
        error: error.message
      };
    }
  }

  public async updateInstanceFilters({ instanceName }: InstanceDto, filterData: any) {
    try {
      const instance = this.waMonitor.waInstances[instanceName];
      if (!instance) {
        throw new BadRequestException(`Instance "${instanceName}" not found`);
      }

      this.logger.log(`Updating filters for instance ${instanceName}`);

      // Atualiza configurações do evento manager
      await eventManager.setInstance(instanceName, filterData);

      // Força recarga das configurações na instância
      if (instance.localWebhook && filterData.webhook) {
        Object.assign(instance.localWebhook, filterData.webhook);
      }

      this.logger.log(`Filters updated successfully for instance ${instanceName}`);

      return {
        status: 'SUCCESS',
        error: false,
        response: {
          message: `Filters updated for instance "${instanceName}"`,
          instanceName,
          updatedFilters: filterData
        }
      };

    } catch (error) {
      this.logger.error(`Error updating instance filters: ${error.message}`);
      throw new BadRequestException(error.toString());
    }
  }

  public async getInstanceFilters({ instanceName }: InstanceDto) {
    try {
      const instance = this.waMonitor.waInstances[instanceName];
      if (!instance) {
        throw new BadRequestException(`Instance "${instanceName}" not found`);
      }

      // Busca configurações do banco de dados
      const dbInstance = await this.prismaRepository.instance.findFirst({
        where: { name: instanceName },
        include: {
          Webhook: true,
          Websocket: true,
          Rabbitmq: true,
          Sqs: true,
          Pusher: true,
        }
      });

      if (!dbInstance) {
        throw new BadRequestException(`Instance "${instanceName}" not found in database`);
      }

      const currentFilters = {
        webhook: dbInstance.Webhook ? {
          enabled: dbInstance.Webhook.enabled,
          url: dbInstance.Webhook.url,
          events: dbInstance.Webhook.events,
          messageTypes: dbInstance.Webhook.messageTypes || [],
          excludeMessageTypes: dbInstance.Webhook.excludeMessageTypes || [],
          textFilters: dbInstance.Webhook.textFilters || {},
          audioProcessing: dbInstance.Webhook.audioProcessing || {}
        } : null,
        websocket: dbInstance.Websocket ? {
          enabled: dbInstance.Websocket.enabled,
          events: dbInstance.Websocket.events,
          // messageTypes: dbInstance.Websocket.messageTypes || [],
          // excludeMessageTypes: dbInstance.Websocket.excludeMessageTypes || [],
          // textFilters: dbInstance.Websocket.textFilters || {},
          // audioProcessing: dbInstance.Websocket.audioProcessing || {}
        } : null,
        // ... outros tipos de integração
      };

      return {
        status: 'SUCCESS',
        error: false,
        response: {
          instanceName,
          currentFilters,
          availableMessageTypes: [
            'conversation',
            'extendedTextMessage',
            'audioMessage',
            'imageMessage',
            'videoMessage',
            'documentMessage',
            'contactMessage',
            'locationMessage',
            'listResponseMessage',
            'templateButtonReplyMessage',
            'viewOnceMessageV2',
            'documentWithCaptionMessage',
            'stickerMessage',
            'ptvMessage'
          ]
        }
      };

    } catch (error) {
      this.logger.error(`Error getting instance filters: ${error.message}`);
      throw new BadRequestException(error.toString());
    }
  }

  public async getGlobalQueueStats() {
    try {
      const queueConfig = this.configService.get<GlobalQueue>('GLOBAL_QUEUE');

      if (!queueConfig.ENABLED) {
        return {
          status: 'SUCCESS',
          error: false,
          response: {
            enabled: false,
            message: 'Global queue is disabled'
          }
        };
      }

      const queueStatus = this.globalQueueService.getQueueStatus();

      return {
        status: 'SUCCESS',
        error: false,
        response: {
          enabled: true,
          tokenBucket: queueStatus,
          config: {
            rateLimit: queueConfig.RATE_LIMIT,
            rateInterval: queueConfig.RATE_INTERVAL,
            capacity: queueConfig.TOKEN_BUCKET.CAPACITY,
            refillRate: queueConfig.TOKEN_BUCKET.REFILL_RATE,
          },
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      this.logger.error(`Error getting global queue stats: ${error.message}`);
      throw new BadRequestException(error.toString());
    }
  }

  public async getGlobalQueueMetrics() {
    try {
      const queueConfig = this.configService.get<GlobalQueue>('GLOBAL_QUEUE');

      if (!queueConfig.ENABLED) {
        return {
          status: 'SUCCESS',
          error: false,
          response: {
            enabled: false,
            message: 'Global queue is disabled'
          }
        };
      }

      // For now, return basic metrics. In a full implementation,
      // this would use the MetricsService
      const basicMetrics = {
        queueSize: 0,
        isProcessorRunning: false,
        processedToday: 0,
        totalErrors: 0,
        rateLimitHits: 0,
        healthStatus: 'healthy',
        lastUpdated: new Date().toISOString()
      };

      return {
        status: 'SUCCESS',
        error: false,
        response: {
          enabled: true,
          metrics: basicMetrics,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      this.logger.error(`Error getting global queue metrics: ${error.message}`);
      throw new BadRequestException(error.toString());
    }
  }

  public async resetGlobalQueueMetrics() {
    try {
      const queueConfig = this.configService.get<GlobalQueue>('GLOBAL_QUEUE');

      if (!queueConfig.ENABLED) {
        return {
          status: 'SUCCESS',
          error: false,
          response: {
            enabled: false,
            message: 'Global queue is disabled'
          }
        };
      }

      // In a full implementation, this would reset the MetricsService
      this.logger.info('Global queue metrics reset requested');

      return {
        status: 'SUCCESS',
        error: false,
        response: {
          message: 'Global queue metrics reset successfully',
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      this.logger.error(`Error resetting global queue metrics: ${error.message}`);
      throw new BadRequestException(error.toString());
    }
  }

  public async getAudioFilters({ instanceName }: InstanceDto) {
    try {
      const instance = this.waMonitor.waInstances[instanceName];
      if (!instance) {
        throw new BadRequestException(`Instance "${instanceName}" not found`);
      }

      const filters = await this.prismaRepository.instanceAudioFilter.findUnique({
        where: { instanceName }
      });

      const defaultFilters = {
        minDurationSeconds: 3,
        maxDurationSeconds: 300,
        enabled: true,
        replyToOversizeAudio: true,
        oversizeReaction: "⸘"
      };

      return {
        status: 'SUCCESS',
        error: false,
        response: filters || defaultFilters
      };

    } catch (error) {
      this.logger.error(`Error getting audio filters: ${error.message}`);
      throw new BadRequestException(error.toString());
    }
  }

  public async updateAudioFilters({ instanceName }: InstanceDto, data: {
    minDurationSeconds: number;
    maxDurationSeconds: number;
    enabled: boolean;
    replyToOversizeAudio?: boolean;
    oversizeReaction?: string;
  }) {
    try {
      const instance = this.waMonitor.waInstances[instanceName];
      if (!instance) {
        throw new BadRequestException(`Instance "${instanceName}" not found`);
      }

      // Validações
      if (data.minDurationSeconds < 1 || data.minDurationSeconds > 7200) {
        throw new BadRequestException('minDurationSeconds deve ser entre 1-7200 segundos');
      }

      if (data.maxDurationSeconds < data.minDurationSeconds || data.maxDurationSeconds > 7200) {
        throw new BadRequestException('maxDurationSeconds deve ser maior que minDurationSeconds e máximo 7200 segundos');
      }

      const updatedFilter = await this.prismaRepository.instanceAudioFilter.upsert({
        where: { instanceName },
        create: { instanceName, ...data },
        update: data
      });

      this.logger.log(`Audio filters updated for instance ${instanceName}`);

      return {
        status: 'SUCCESS',
        error: false,
        response: {
          message: `Audio filters updated for instance "${instanceName}"`,
          filters: updatedFilter
        }
      };

    } catch (error) {
      this.logger.error(`Error updating audio filters: ${error.message}`);
      throw new BadRequestException(error.toString());
    }
  }

  public async getQueueStats() {
    try {
      const queueConfig = this.configService.get<GlobalQueue>('GLOBAL_QUEUE');

      if (!queueConfig.ENABLED) {
        return {
          status: 'SUCCESS',
          error: false,
          response: {
            enabled: false,
            message: 'Global queue is disabled'
          }
        };
      }

      // Obtém estatísticas básicas da fila
      const queueStatus = this.globalQueueService.getQueueStatus();

      // Para uma implementação completa, aqui obteríamos estatísticas reais do RabbitMQ
      const mockStats = {
        queueSize: 0,
        processedToday: 0,
        rateLimitStatus: queueStatus,
        audioFilterStats: {
          tooShort: 0,
          tooLong: 0,
          processed: 0
        }
      };

      return {
        status: 'SUCCESS',
        error: false,
        response: mockStats
      };

    } catch (error) {
      this.logger.error(`Error getting queue stats: ${error.message}`);
      throw new BadRequestException(error.toString());
    }
  }

  public async getAudioFilterStats({ instanceName }: InstanceDto) {
    try {
      const instance = this.waMonitor.waInstances[instanceName];
      if (!instance) {
        throw new BadRequestException(`Instance "${instanceName}" not found`);
      }

      const statsService = AudioFilterStatsService.getInstance();
      const statsReport = statsService.getStatsReport(instanceName);

      return {
        status: 'SUCCESS',
        error: false,
        response: statsReport
      };

    } catch (error) {
      this.logger.error(`Error getting audio filter stats: ${error.message}`);
      throw new BadRequestException(error.toString());
    }
  }

  public async resetAudioFilterStats({ instanceName }: InstanceDto) {
    try {
      const instance = this.waMonitor.waInstances[instanceName];
      if (!instance) {
        throw new BadRequestException(`Instance "${instanceName}" not found`);
      }

      const statsService = AudioFilterStatsService.getInstance();
      statsService.resetStats(instanceName);

      return {
        status: 'SUCCESS',
        error: false,
        response: {
          message: `Audio filter stats reset for instance "${instanceName}"`
        }
      };

    } catch (error) {
      this.logger.error(`Error resetting audio filter stats: ${error.message}`);
      throw new BadRequestException(error.toString());
    }
  }

  public async getAllAudioFilterStats() {
    try {
      const statsService = AudioFilterStatsService.getInstance();
      const allStats = statsService.getAllStats();

      // Gerar relatórios para todas as instâncias
      const reports = {};
      Object.keys(allStats).forEach(instanceName => {
        reports[instanceName] = statsService.getStatsReport(instanceName);
      });

      return {
        status: 'SUCCESS',
        error: false,
        response: {
          totalInstances: Object.keys(allStats).length,
          reports
        }
      };

    } catch (error) {
      this.logger.error(`Error getting all audio filter stats: ${error.message}`);
      throw new BadRequestException(error.toString());
    }
  }
}
