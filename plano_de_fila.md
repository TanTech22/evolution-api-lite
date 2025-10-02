# Sistema de Fila Global com Rate Limiting - Evolution API Lite

## 🎯 Objetivo Final (Versão Evoluída)

Implementar um sistema robusto para gerenciar eventos WhatsApp de 500 instâncias simultâneas com:
- **Filtros por duração de áudio** (3 segundos a 5 minutos, configurável por instância)
- **Upload S3-only** (sem downloads locais por segurança)
- **Fila RabbitMQ global** com rate limiting (500 msg/minuto padrão)
- **Dual webhook system** (dados principais + monitoramento separado)
- **Zero persistência local** de dados de áudio (máxima segurança)
- **100% compatibilidade** com estrutura Evolution API existente

## 🚨 Evoluções Importantes da Conversa

### ❌ Decisões Anteriores Descartadas:
1. **~~Base64 storage~~** → Muito arriscado para segurança
2. **~~Download local~~** → Limitaria severamente o processamento
3. **~~Filtro por tamanho~~** → Mudamos para filtro por tempo
4. **~~Webhook único~~** → Separamos dados principais de monitoramento

### ✅ Arquitetura Final Definida:

#### **1. Processamento de Áudio S3-Only**
```typescript
// NO whatsapp.baileys.service.ts - SEM download local
if (message.audioMessage) {
  const audioDuration = message.audioMessage.seconds || 0;

  // Filtro por duração (3s-5min configurável)
  if (audioDuration < instanceConfig.minAudioSeconds ||
      audioDuration > instanceConfig.maxAudioSeconds) {
    return; // Descarta áudio fora dos limites
  }

  // Upload direto para S3/MinIO (já implementado)
  const mediaUrl = await this.uploadToS3(message.audioMessage);

  // Adiciona URL e metadados ao webhook (SEM dados binários)
  webhookData.audioUrl = mediaUrl;
  webhookData.audioDuration = audioDuration;
  webhookData.mimeType = message.audioMessage.mimetype;
}
```

#### **2. Sistema de Filtros por Duração**
```typescript
interface AudioDurationFilter {
  enabled: boolean;
  minSeconds: number;      // Padrão: 3 segundos
  maxSeconds: number;      // Padrão: 7200 segundos (120 min)
  customPerInstance: {
    [instanceName: string]: {
      minSeconds: number;
      maxSeconds: number;
    }
  }
}

// Configuração por instância no banco
interface InstanceFilterConfig {
  instanceName: string;
  audioFilter: {
    minDurationSeconds: number;  // 3-7200
    maxDurationSeconds: number;  // 3-7200
    enabled: boolean;
  }
}
```

#### **3. Dual Webhook Architecture**
```typescript
// Webhook Principal (dados de negócio)
interface MainWebhookPayload {
  event: string;
  instance: string;
  data: {
    key: MessageKey;
    message: any;
    audioUrl?: string;        // URL S3 apenas
    audioDuration?: number;   // Segundos
    mimeType?: string;        // audio/ogg, etc
  };
  server_url: string;
  apikey: string;
}

// Webhook Monitoramento (erros e estatísticas)
interface MonitoringWebhookPayload {
  event: 'queue.error' | 'queue.stats' | 'filter.applied';
  timestamp: string;
  instance?: string;
  data: {
    error?: string;
    queueSize?: number;
    processedCount?: number;
    filteredCount?: number;
    audioFilterStats?: {
      tooShort: number;
      tooLong: number;
      processed: number;
    }
  };
  server_url: string;
}
```

## 📊 Análise da Arquitetura Atual

### Infraestrutura Existente (Verificada)
- ✅ **RabbitMQ**: Configurado com filas por instância
- ✅ **S3/MinIO**: Upload de mídia já implementado
- ✅ **Audio Duration**: `message.audioMessage.seconds` disponível no Baileys
- ✅ **Filtros**: Base em `messageFilter.ts` para expandir
- ✅ **PostgreSQL**: Banco configurado para armazenar configurações

### Pontos de Integração Identificados
- `src/api/integrations/channel/whatsapp/whatsapp.baileys.service.ts:712` - downloadMediaMessage
- `src/utils/messageFilter.ts` - Sistema de filtros atual
- `src/api/integrations/event/rabbitmq/` - Controle RabbitMQ
- `src/config/env.config.ts` - Configurações ambiente

## 🏗️ Componentes do Sistema

### 1. Rate Limiting com Token Bucket

```typescript
interface TokenBucketConfig {
  capacity: number;           // 500 tokens padrão
  refillRate: number;         // tokens/minuto
  refillInterval: number;     // milissegundos
}

class GlobalTokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(private config: TokenBucketConfig) {
    this.tokens = config.capacity;
    this.lastRefill = Date.now();
  }

  async consume(amount: number = 1): Promise<boolean> {
    this.refill();

    if (this.tokens >= amount) {
      this.tokens -= amount;
      return true;
    }

    return false; // Rate limit atingido
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(
      (timePassed / this.config.refillInterval) * this.config.refillRate
    );

    this.tokens = Math.min(
      this.config.capacity,
      this.tokens + tokensToAdd
    );
    this.lastRefill = now;
  }
}
```

### 2. Fila Global RabbitMQ

```typescript
interface GlobalQueueMessage {
  id: string;
  instanceName: string;
  messageData: any;
  audioMetadata?: {
    url: string;
    duration: number;
    mimeType: string;
  };
  timestamp: number;
  priority: number;
}

class GlobalMessageQueue {
  private tokenBucket: GlobalTokenBucket;

  async enqueue(message: GlobalQueueMessage): Promise<boolean> {
    // Verifica rate limiting
    if (!await this.tokenBucket.consume()) {
      await this.sendMonitoringWebhook({
        event: 'queue.error',
        data: { error: 'Rate limit exceeded' }
      });
      return false;
    }

    // Adiciona à fila global
    await this.rabbitmq.publish('global.messages', message);
    return true;
  }

  async processQueue(): Promise<void> {
    const message = await this.rabbitmq.consume('global.messages');

    try {
      // Processa mensagem
      await this.sendMainWebhook(message);

      // Estatísticas de monitoramento
      await this.updateQueueStats();

    } catch (error) {
      await this.sendMonitoringWebhook({
        event: 'queue.error',
        data: { error: error.message }
      });
    }
  }
}
```

### 3. Sistema de Configuração por Instância

```sql
-- Tabela para configurações de filtro por instância
CREATE TABLE instance_audio_filters (
  id SERIAL PRIMARY KEY,
  instance_name VARCHAR(255) UNIQUE NOT NULL,
  min_duration_seconds INTEGER DEFAULT 3,
  max_duration_seconds INTEGER DEFAULT 300,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_instance_audio_filters_name ON instance_audio_filters(instance_name);
```

```typescript
// Prisma schema addition
model InstanceAudioFilter {
  id                  Int      @id @default(autoincrement())
  instanceName        String   @unique @map("instance_name")
  minDurationSeconds  Int      @default(3) @map("min_duration_seconds")
  maxDurationSeconds  Int      @default(300) @map("max_duration_seconds")
  enabled             Boolean  @default(true)
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")

  @@map("instance_audio_filters")
}
```

### 4. Endpoints de Configuração

```typescript
// src/api/controllers/instance.controller.ts
@Get(':instance/filters/audio')
async getAudioFilters(@Param('instance') instance: string) {
  const filters = await this.prisma.instanceAudioFilter.findUnique({
    where: { instanceName: instance }
  });

  return filters || {
    minDurationSeconds: 3,
    maxDurationSeconds: 7200,
    enabled: true
  };
}

@Put(':instance/filters/audio')
async updateAudioFilters(
  @Param('instance') instance: string,
  @Body() data: { minDurationSeconds: number; maxDurationSeconds: number; enabled: boolean }
) {
  // Validações
  if (data.minDurationSeconds < 1 || data.minDurationSeconds > 300) {
    throw new BadRequestException('minDurationSeconds deve ser entre 1-300');
  }

  if (data.maxDurationSeconds < data.minDurationSeconds || data.maxDurationSeconds > 300) {
    throw new BadRequestException('maxDurationSeconds inválido');
  }

  return await this.prisma.instanceAudioFilter.upsert({
    where: { instanceName: instance },
    create: { instanceName: instance, ...data },
    update: data
  });
}

@Get('queue/stats')
async getQueueStats() {
  return {
    queueSize: await this.rabbitmq.getQueueSize('global.messages'),
    processedToday: await this.getProcessedCount(),
    rateLimitStatus: this.tokenBucket.getStatus(),
    audioFilterStats: await this.getAudioFilterStats()
  };
}

// Endpoints de Cleanup S3 - ✅ IMPLEMENTADO
@Get('cleanup/schedule')
async getCleanupSchedule() {
  return {
    enabled: true,
    retentionDays: 1,
    dailyTime: "03:00",
    timezone: "America/Sao_Paulo"
  };
}

@Put('cleanup/schedule')
async updateCleanupSchedule(
  @Body() data: {
    enabled?: boolean;
    retentionDays?: number;
    dailyTime?: string;
    timezone?: string
  }
) {
  // Configurar horário e retenção do cleanup automático S3
  return await this.s3CleanupScheduler.updateConfig(data);
}

@Post('cleanup/execute')
async executeManualCleanup() {
  // Executar cleanup manual imediato
  return await this.s3CleanupScheduler.manualCleanup();
}

@Get('cleanup/status')
async getCleanupStatus() {
  // Ver próxima execução e estatísticas
  return {
    enabled: true,
    nextExecution: "2025-10-02T03:00:00-03:00",
    retentionDays: 1,
    lastCleanup: {
      timestamp: "2025-10-01T03:00:00-03:00",
      deletedCount: 127,
      errorCount: 0
    }
  };
}

// === GLOBAL WEBHOOK CONFIGURATION SYSTEM === ✅ IMPLEMENTADO
// Sistema de configuração persistente de webhooks globais via API

@Get('webhook/global/config')
async getGlobalWebhookConfig() {
  // Retorna configuração atual dos webhooks globais
  // Permite consultar estado persistido no banco de dados
  return {
    success: true,
    data: {
      principal: {
        enabled: false,              // Webhook principal habilitado/desabilitado
        url: "https://example.com/webhook"
      },
      monitoramento: {
        enabled: false,              // Webhook de monitoramento habilitado/desabilitado
        url: "https://monitor.example.com/webhook"
      },
      webhookByEvents: false,        // Separar webhooks por tipo de evento
      headers: {                     // Headers HTTP customizados
        "Authorization": "Bearer token123",
        "X-Custom-Header": "custom-value"
      },
      createdAt: "2025-10-01T06:55:53.755Z",
      updatedAt: "2025-10-01T06:55:53.755Z"
    }
  };
}

@Post('webhook/global/config')
@Put('webhook/global/config')
async setGlobalWebhookConfig(
  @Body() data: {
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
) {
  // Cria ou atualiza configuração global de webhooks
  // Permite atualizações parciais (merge inteligente)
  // Valida URLs automaticamente
  // Substitui configuração por variáveis de ambiente
  return {
    success: true,
    message: "Global webhook configuration updated successfully",
    data: {
      principal: { enabled: true, url: "https://example.com/webhook" },
      monitoramento: { enabled: true, url: "https://monitor.example.com/webhook" },
      webhookByEvents: true,
      headers: { "Authorization": "Bearer token123" },
      createdAt: "2025-10-01T06:55:53.755Z",
      updatedAt: "2025-10-01T06:55:53.755Z"
    }
  };
}

@Delete('webhook/global/config')
async deleteGlobalWebhookConfig() {
  // Desabilita todos os webhooks globais
  // Mantém URLs configuradas mas disabled
  // Permite reativação posterior sem reconfigurar URLs
  return {
    success: true,
    message: "Global webhook configuration disabled successfully",
    data: {
      principal: { enabled: false, url: "https://example.com/webhook" },
      monitoramento: { enabled: false, url: "https://monitor.example.com/webhook" },
      webhookByEvents: true,
      headers: { "Authorization": "Bearer token123" },
      disabledAt: "2025-10-01T06:56:51.686Z"
    }
  };
}

@Post('webhook/global/test')
async testGlobalWebhook(
  @Body() data: {
    url: string;
    type?: 'principal' | 'monitoramento';
  }
) {
  // Testa conectividade de webhook antes de salvar
  // Envia payload de teste com timeout de 10 segundos
  // Retorna tempo de resposta e headers recebidos
  return {
    success: true,
    data: {
      url: "https://httpbin.org/post",
      success: true,
      statusCode: 200,
      statusText: "OK",
      responseTime: "511ms",
      headers: {
        "content-type": "application/json",
        "server": "gunicorn/19.9.0"
      },
      testedAt: "2025-10-01T06:56:33.484Z"
    }
  };
}

// === PROCESSING FEEDBACK SYSTEM === ✅ IMPLEMENTADO
// Sistema de feedback visual para processamento de mensagens

@Post('process/start')
async startProcessing(
  @Body() data: {
    instance: string;
    chatId: string;        // WhatsApp ID (e.g., 5511999999999@s.whatsapp.net)
    messageId: string;
    processType?: string;  // Tipo do processamento (opcional)
  }
) {
  // Inicia feedback visual com reactions alternadas
  // Loop: 🔄 → ⏳ → 🔄 → ⏳ (a cada 3 segundos)
  // Timeout automático: 10 minutos → reaction 🤷 + limpeza
  return {
    success: true,
    sessionId: "instance:chatId:messageId",
    startedAt: "2025-10-01T06:20:00.000Z"
  };
}

@Post('process/finish')
async finishProcessing(
  @Body() data: {
    instance: string;
    chatId: string;
    messageId: string;
    status: 'success' | 'error' | 'aborted';
    errorMessage?: string;
    texto?: string;        // ✅ NOVO: Texto a ser enviado após processamento
  }
) {
  // Para o loop de reactions
  // Define reaction final: ✅ (success), ❌ (error), ⚠️ (aborted)
  // Se 'texto' presente: envia mensagem para o chat
  // Limpa sessão automaticamente
  // Cancela timeout (evita reaction 🤷)
  return {
    success: true,
    finishedAt: "2025-10-01T06:25:00.000Z"
  };
}

@Get('process/status')
async getProcessingStatus() {
  // Monitora todas as sessões ativas de processamento
  return {
    activeSessionsCount: 2,
    activeSessions: [
      {
        sessionId: "instance1:5511999999999@s.whatsapp.net:msg123",
        instance: "instance1",
        chatId: "5511999999999@s.whatsapp.net",
        messageId: "msg123",
        processType: "audio-transcription",
        startTime: "2025-10-01T06:20:00.000Z",
        timeoutAt: "2025-10-01T06:30:00.000Z",  // 10 minutos após início
        currentReaction: 1,  // 0=🔄, 1=⏳
        runningFor: 120000   // milissegundos
      }
    ],
    stats: {
      activeCount: 2,
      totalStarted: 0,
      averageProcessingTime: 0
    }
  };
}

@Delete('process/:sessionId')
async forceCleanup(@Param('sessionId') sessionId: string) {
  // Força limpeza de uma sessão específica (admin/debug)
  // Para loops, limpa timers, remove da memória
  return {
    success: true,
    sessionId: sessionId,
    cleanedAt: "2025-10-01T06:25:00.000Z"
  };
}
```

## 🔄 Fluxo Completo do Sistema

### 0. Fluxo Processing Feedback (✅ IMPLEMENTADO)

```typescript
// Fluxo típico de processamento com feedback visual
async function processMessageWithFeedback(instance: string, chatId: string, messageId: string) {
  try {
    // 1. Iniciar feedback visual
    const startResponse = await fetch('/process/start', {
      method: 'POST',
      body: JSON.stringify({
        instance,
        chatId,
        messageId,
        processType: 'audio-transcription'
      })
    });

    // Sistema inicia loop: 🔄 → ⏳ → 🔄 → ⏳ (3s cada)
    // Timeout automático: 10 minutos → 🤷 + limpeza

    // 2. Processar mensagem (lógica externa)
    const result = await processAudioMessage(audioUrl);

    // 3a. Finalizar com sucesso + enviar resultado
    if (result.success) {
      await fetch('/process/finish', {
        method: 'POST',
        body: JSON.stringify({
          instance,
          chatId,
          messageId,
          status: 'success',
          texto: `🎉 Transcrição pronta: "${result.transcription}"`
        })
      });
      // Para loop + reaction ✅ + envia texto + limpa sessão

    // 3b. Finalizar com erro
    } else {
      await fetch('/process/finish', {
        method: 'POST',
        body: JSON.stringify({
          instance,
          chatId,
          messageId,
          status: 'error',
          errorMessage: result.error,
          texto: '❌ Erro na transcrição. Tente enviar novamente.'
        })
      });
      // Para loop + reaction ❌ + envia texto + limpa sessão
    }

  } catch (error) {
    // 3c. Finalizar com abort
    await fetch('/process/finish', {
      method: 'POST',
      body: JSON.stringify({
        instance,
        chatId,
        messageId,
        status: 'aborted',
        texto: '⚠️ Processamento interrompido.'
      })
    });
    // Para loop + reaction ⚠️ + envia texto + limpa sessão
  }
}

// Cenários de timeout automático:
// Se finish() NÃO for chamado em 10 minutos:
// → Para loop automaticamente
// → Define reaction 🤷
// → Limpa sessão
// → NÃO envia texto (sem campo 'texto' no timeout)
```

### 1. Recebimento de Mensagem (whatsapp.baileys.service.ts)

```typescript
async onMessage(message: WAMessage) {
  const instanceConfig = await this.getInstanceAudioConfig(this.instanceName);

  // 1. Verifica se é áudio
  if (message.audioMessage) {
    const duration = message.audioMessage.seconds || 0;

    // 2. Aplica filtro de duração
    if (!this.isAudioDurationValid(duration, instanceConfig)) {
      await this.incrementFilterStats('duration_filtered');
      return; // Descarta mensagem
    }

    // 3. Upload direto para S3 (SEM download local)
    const audioUrl = await this.uploadAudioToS3(message.audioMessage);

    // 4. Prepara dados para fila
    const queueMessage: GlobalQueueMessage = {
      id: generateId(),
      instanceName: this.instanceName,
      messageData: {
        ...message,
        audioUrl,
        audioDuration: duration,
        mimeType: message.audioMessage.mimetype
      },
      timestamp: Date.now(),
      priority: 1
    };

    // 5. Adiciona à fila global
    const success = await this.globalQueue.enqueue(queueMessage);
    if (!success) {
      console.log('Rate limit atingido - mensagem descartada');
    }
  }
}

private isAudioDurationValid(duration: number, config: InstanceAudioConfig): boolean {
  if (!config.enabled) return true;

  return duration >= config.minDurationSeconds &&
         duration <= config.maxDurationSeconds;
}

private async uploadAudioToS3(audioMessage: AudioMessage): Promise<string> {
  // Usa infraestrutura S3 existente da Evolution API
  const stream = await downloadContentFromMessage(audioMessage, 'audio');
  const fileName = `audio_${Date.now()}.${audioMessage.mimetype.split('/')[1]}`;

  // Upload direto para S3/MinIO
  const url = await this.minioService.upload(fileName, stream);
  return url;
}
```

### 2. Processamento da Fila Global

```typescript
class GlobalQueueProcessor {
  async processMessages() {
    while (true) {
      try {
        const message = await this.rabbitmq.consume('global.messages');
        if (!message) {
          await this.sleep(100);
          continue;
        }

        // Envia webhook principal
        await this.sendMainWebhook(message);

        // Atualiza estatísticas
        await this.updateStats(message.instanceName);

        // ACK mensagem
        await this.rabbitmq.ack(message);

      } catch (error) {
        // Envia erro para webhook de monitoramento
        await this.sendMonitoringWebhook({
          event: 'queue.error',
          timestamp: new Date().toISOString(),
          data: { error: error.message }
        });
      }
    }
  }

  private async sendMainWebhook(message: GlobalQueueMessage) {
    const webhookUrl = await this.getInstanceWebhookUrl(message.instanceName);

    const payload = {
      event: 'messages.upsert',
      instance: message.instanceName,
      data: message.messageData,
      server_url: this.configService.get('SERVER').URL,
      apikey: this.configService.get('AUTHENTICATION').API_KEY.KEY
    };

    await axios.post(webhookUrl, payload);
  }

  private async sendMonitoringWebhook(data: MonitoringWebhookPayload) {
    const monitoringUrl = this.configService.get('WEBHOOK').MONITORING_URL;
    if (!monitoringUrl) return;

    await axios.post(monitoringUrl, {
      ...data,
      server_url: this.configService.get('SERVER').URL
    });
  }
}
```

## 🔧 Configurações Ambiente

```env
# Fila Global
GLOBAL_QUEUE_ENABLED=true
GLOBAL_QUEUE_RATE_LIMIT=500
GLOBAL_QUEUE_RATE_INTERVAL=60000

# Rate Limiting Token Bucket
TOKEN_BUCKET_CAPACITY=500
TOKEN_BUCKET_REFILL_RATE=500
TOKEN_BUCKET_REFILL_INTERVAL=60000

# Audio Filtering
AUDIO_FILTER_DEFAULT_MIN_SECONDS=3
AUDIO_FILTER_DEFAULT_MAX_SECONDS=7200
AUDIO_FILTER_ENABLED=true

# Dual Webhooks
WEBHOOK_MONITORING_URL=https://your-monitoring-webhook.com
WEBHOOK_MONITORING_ENABLED=true

# S3 (já existente)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=minio123
MINIO_BUCKET=evolution

# S3 Cleanup Automático (✅ IMPLEMENTADO)
S3_CLEANUP_ENABLED=true
S3_CLEANUP_DAYS=1
S3_CLEANUP_SCHEDULE_TIME=03:00
S3_CLEANUP_TIMEZONE=America/Sao_Paulo

# Processing Feedback System (✅ IMPLEMENTADO)
PROCESSING_FEEDBACK_ENABLED=true
PROCESSING_FEEDBACK_LOOP_INTERVAL=3000     # 3 segundos entre reactions
PROCESSING_FEEDBACK_TIMEOUT=600000         # 10 minutos timeout
PROCESSING_FEEDBACK_REACTIONS_PROCESSING=🔄,⏳
PROCESSING_FEEDBACK_REACTIONS_FINAL_SUCCESS=✅
PROCESSING_FEEDBACK_REACTIONS_FINAL_ERROR=❌
PROCESSING_FEEDBACK_REACTIONS_FINAL_ABORTED=⚠️
PROCESSING_FEEDBACK_REACTIONS_FINAL_TIMEOUT=🤷
```

## 📈 Roadmap de Implementação (8 dias)

### **Sprint 1: Fundação (Dias 1-3)**

#### Dia 1: Rate Limiting & Token Bucket
- [x] Implementar classe `GlobalTokenBucket`
- [x] Testes unitários do rate limiting
- [x] Configuração via environment
- [x] Endpoint para monitorar status

#### Dia 2: Fila Global RabbitMQ
- [x] Criar fila `global.messages`
- [x] Implementar `GlobalQueueProcessor`
- [x] Sistema de retry para falhas
- [x] Métricas básicas de fila

#### Dia 3: Schema Database & Endpoints
- [x] Migração Prisma para `instance_audio_filters`
- [x] Endpoints CRUD para configuração
- [x] Validações de entrada
- [x] Testes de API

### **Sprint 2: Core Logic (Dias 4-6)**

#### Dia 4: Filtros por Duração
- [x] Integração com `whatsapp.baileys.service.ts`
- [x] Lógica de filtro por duração
- [x] Configuração por instância
- [x] Estatísticas de filtros aplicados

#### Dia 5: Upload S3-Only
- [x] Remover downloads locais
- [x] Upload direto para S3/MinIO
- [x] Gestão de URLs públicas
- [x] Cleanup de arquivos antigos ✅ **IMPLEMENTADO COM SCHEDULER CONFIGURÁVEL**

#### Dia 6: Dual Webhook System + Processing Feedback
- [x] Webhook principal (dados)
- [x] Webhook monitoramento (erros/stats)
- [x] Tratamento de falhas
- [x] Logs estruturados
- [x] **Sistema Processing Feedback** ✅ IMPLEMENTADO
- [x] Endpoint `/process/start` - inicia feedback visual
- [x] Endpoint `/process/finish` - finaliza com texto opcional
- [x] Endpoint `/process/status` - monitora sessões ativas
- [x] Loop reactions alternadas (🔄 ⏳) a cada 3s
- [x] Timeout automático 10 minutos → reaction 🤷
- [x] Reactions finais: ✅ ❌ ⚠️ conforme status
- [x] Envio de texto após processamento
- [x] Gerenciamento de sessões em memória
- [x] **Sistema Global Webhook Configuration** ✅ IMPLEMENTADO
- [x] Endpoint `GET /webhook/global/config` - consultar configuração
- [x] Endpoint `POST/PUT /webhook/global/config` - criar/atualizar
- [x] Endpoint `DELETE /webhook/global/config` - desabilitar webhooks
- [x] Endpoint `POST /webhook/global/test` - testar conectividade
- [x] Persistência em banco de dados
- [x] Validação de URLs e merge inteligente
- [x] Headers HTTP customizáveis
- [x] Substitui configuração por variáveis de ambiente

### **Sprint 3: Finalização (Dias 7-8)**

#### Dia 7: Integração & Testes
- [_] Testes de carga (500 instâncias) - postergado
- [x] Validação end-to-end
- [x] Monitoramento de performance
- [x] Ajustes de otimização

#### Dia 8:  Documentação técnica
- [x] Documentação técnica ✅ **CONCLUÍDO**
- [x] Guia de configuração ✅ **CONCLUÍDO**

#### Dia 9:  Deploy
- [ ] Monitoramento operacional
- [ ] Deploy em produção

## 🔍 Exemplos de Uso

### Configurar Filtro de Áudio para Instância

```bash
# Configurar instância para aceitar áudios de 5-60 segundos
curl -X PUT "http://localhost:8080/instance/minhainstancia/filters/audio" \\
  -H "Content-Type: application/json" \\
  -H "apikey: sua-chave" \\
  -d '{
    "minDurationSeconds": 5,
    "maxDurationSeconds": 60,
    "enabled": true
  }'
```

### Gerenciar Cleanup S3 (✅ IMPLEMENTADO)

```bash
# Ver configuração atual do cleanup
curl "http://localhost:8080/cleanup/schedule" \\
  -H "apikey: BQYHJGJHJ"

# Alterar horário para 2:30 e retenção para 2 dias
curl -X PUT "http://localhost:8080/cleanup/schedule" \\
  -H "Content-Type: application/json" \\
  -H "apikey: BQYHJGJHJ" \\
  -d '{
    "dailyTime": "02:30",
    "retentionDays": 2,
    "enabled": true
  }'

# Executar cleanup manual
curl -X POST "http://localhost:8080/cleanup/execute" \\
  -H "apikey: BQYHJGJHJ"

# Ver status e próxima execução
curl "http://localhost:8080/cleanup/status" \\
  -H "apikey: BQYHJGJHJ"
```

### Configuração Global de Webhooks (✅ IMPLEMENTADO)

```bash
# Consultar configuração atual dos webhooks globais
curl "http://localhost:8080/webhook/global/config" \\
  -H "apikey: BQYHJGJHJ"

# Resposta:
{
  "success": true,
  "data": {
    "principal": {
      "enabled": false,
      "url": null
    },
    "monitoramento": {
      "enabled": false,
      "url": null
    },
    "webhookByEvents": false,
    "headers": null,
    "createdAt": null,
    "updatedAt": null
  }
}

# Configurar webhooks principal e de monitoramento
curl -X POST "http://localhost:8080/webhook/global/config" \\
  -H "Content-Type: application/json" \\
  -H "apikey: BQYHJGJHJ" \\
  -d '{
    "principal": {
      "enabled": true,
      "url": "https://example.com/webhook"
    },
    "monitoramento": {
      "enabled": true,
      "url": "https://monitor.example.com/webhook"
    },
    "webhookByEvents": true,
    "headers": {
      "Authorization": "Bearer token123",
      "X-Custom-Header": "custom-value"
    }
  }'

# Atualização parcial (apenas webhook principal)
curl -X PUT "http://localhost:8080/webhook/global/config" \\
  -H "Content-Type: application/json" \\
  -H "apikey: BQYHJGJHJ" \\
  -d '{
    "principal": {
      "enabled": false
    },
    "monitoramento": {
      "url": "https://updated-monitor.example.com/webhook"
    }
  }'

# Testar conectividade de webhook
curl -X POST "http://localhost:8080/webhook/global/test" \\
  -H "Content-Type: application/json" \\
  -H "apikey: BQYHJGJHJ" \\
  -d '{
    "url": "https://httpbin.org/post",
    "type": "principal"
  }'

# Resposta do teste:
{
  "success": true,
  "data": {
    "url": "https://httpbin.org/post",
    "success": true,
    "statusCode": 200,
    "statusText": "OK",
    "responseTime": "511ms",
    "headers": {
      "content-type": "application/json",
      "server": "gunicorn/19.9.0"
    },
    "testedAt": "2025-10-01T06:56:33.484Z"
  }
}

# Desabilitar todos os webhooks (mantém URLs configuradas)
curl -X DELETE "http://localhost:8080/webhook/global/config" \\
  -H "apikey: BQYHJGJHJ"

# Resposta:
{
  "success": true,
  "message": "Global webhook configuration disabled successfully",
  "data": {
    "principal": {
      "enabled": false,
      "url": "https://example.com/webhook"
    },
    "monitoramento": {
      "enabled": false,
      "url": "https://updated-monitor.example.com/webhook"
    },
    "webhookByEvents": true,
    "headers": "{\"Authorization\":\"Bearer token123\"}",
    "disabledAt": "2025-10-01T06:56:51.686Z"
  }
}
```

### Sistema de Processing Feedback (✅ IMPLEMENTADO)

```bash
# Iniciar processamento com feedback visual
curl -X POST "http://localhost:8080/process/start" \\
  -H "Content-Type: application/json" \\
  -d '{
    "instance": "minha-instancia",
    "chatId": "5511999999999@s.whatsapp.net",
    "messageId": "msg-12345",
    "processType": "audio-transcription"
  }'

# Resposta:
{
  "success": true,
  "sessionId": "minha-instancia:5511999999999@s.whatsapp.net:msg-12345",
  "startedAt": "2025-10-01T06:20:00.000Z"
}
# Inicia loop: 🔄 → ⏳ → 🔄 → ⏳ (a cada 3s)
# Timeout: 10 minutos → 🤷 + limpeza automática

# Finalizar processamento com sucesso + texto
curl -X POST "http://localhost:8080/process/finish" \\
  -H "Content-Type: application/json" \\
  -d '{
    "instance": "minha-instancia",
    "chatId": "5511999999999@s.whatsapp.net",
    "messageId": "msg-12345",
    "status": "success",
    "texto": "🎉 Sua transcrição está pronta! O áudio foi processado com sucesso."
  }'
# Para loop + reaction ✅ + envia texto + limpa sessão

# Finalizar com erro
curl -X POST "http://localhost:8080/process/finish" \\
  -H "Content-Type: application/json" \\
  -d '{
    "instance": "minha-instancia",
    "chatId": "5511999999999@s.whatsapp.net",
    "messageId": "msg-12345",
    "status": "error",
    "errorMessage": "Falha na transcrição",
    "texto": "❌ Não foi possível processar o áudio. Tente novamente."
  }'
# Para loop + reaction ❌ + envia texto + limpa sessão

# Finalizar processamento abortado
curl -X POST "http://localhost:8080/process/finish" \\
  -H "Content-Type: application/json" \\
  -d '{
    "instance": "minha-instancia",
    "chatId": "5511999999999@s.whatsapp.net",
    "messageId": "msg-12345",
    "status": "aborted",
    "texto": "⚠️ Processamento cancelado pelo usuário."
  }'
# Para loop + reaction ⚠️ + envia texto + limpa sessão

# Monitorar sessões ativas
curl "http://localhost:8080/process/status"

# Resposta:
{
  "success": true,
  "data": {
    "activeSessionsCount": 1,
    "activeSessions": [
      {
        "sessionId": "minha-instancia:5511999999999@s.whatsapp.net:msg-12345",
        "instance": "minha-instancia",
        "chatId": "5511999999999@s.whatsapp.net",
        "messageId": "msg-12345",
        "processType": "audio-transcription",
        "startTime": "2025-10-01T06:20:00.000Z",
        "timeoutAt": "2025-10-01T06:30:00.000Z",
        "currentReaction": 1,  // 0=🔄, 1=⏳
        "runningFor": 45000    // 45 segundos
      }
    ],
    "stats": {
      "activeCount": 1,
      "totalStarted": 0,
      "averageProcessingTime": 0
    }
  }
}

# Força limpeza de sessão (admin/debug)
curl -X DELETE "http://localhost:8080/process/minha-instancia:5511999999999@s.whatsapp.net:msg-12345"
```

### Monitorar Status da Fila

```bash
# Ver estatísticas da fila global
curl "http://localhost:8080/queue/stats" \\
  -H "apikey: sua-chave"

# Resposta:
{
  "queueSize": 42,
  "processedToday": 15847,
  "rateLimitStatus": {
    "tokens": 245,
    "capacity": 500,
    "refillRate": "500/min"
  },
  "audioFilterStats": {
    "tooShort": 23,
    "tooLong": 8,
    "processed": 156
  }
}
```

### Payload do Webhook Principal

```json
{
  "event": "messages.upsert",
  "instance": "minhainstancia",
  "data": {
    "key": { "remoteJid": "558199999999@s.whatsapp.net", "id": "123" },
    "message": {
      "audioMessage": {
        "mimetype": "audio/ogg; codecs=opus",
        "seconds": 15
      }
    },
    "audioUrl": "https://minio.example.com/evolution/audio_1633024800000.ogg",
    "audioDuration": 15,
    "mimeType": "audio/ogg; codecs=opus"
  },
  "server_url": "http://localhost:8080",
  "apikey": "sua-chave-api"
}
```

### Payload do Webhook Monitoramento

```json
{
  "event": "queue.stats",
  "timestamp": "2023-10-01T10:30:00.000Z",
  "data": {
    "queueSize": 42,
    "processedCount": 15847,
    "audioFilterStats": {
      "tooShort": 23,
      "tooLong": 8,
      "processed": 156
    }
  },
  "server_url": "http://localhost:8080"
}
```

## 🔐 Considerações de Segurança

### 1. **Zero Persistência Local**
- ❌ Nunca gravar áudios no servidor Evolution API
- ✅ Upload direto para S3/MinIO
- ✅ URLs com expiração configurável
- ✅ Cleanup automático de arquivos antigos

### 2. **Controle de Acesso**
- ✅ API Keys obrigatórias em todos endpoints
- ✅ Rate limiting para evitar abuse
- ✅ Logs de auditoria completos
- ✅ Validação rigorosa de inputs

### 3. **Monitoramento**
- ✅ Webhook separado para erros
- ✅ Métricas de performance
- ✅ Alertas automáticos
- ✅ Dashboard de saúde do sistema

## 📊 KPIs e Métricas

### Métricas de Performance
- **Throughput**: Mensagens processadas/minuto
- **Latência**: Tempo médio de processamento
- **Taxa de erro**: % de falhas no webhook
- **Uso de memória**: RAM consumida pela fila

### Métricas de Negócio
- **Áudios filtrados**: Por duração/tamanho
- **Rate limiting**: Hits vs capacidade
- **Instâncias ativas**: Total em uso
- **Webhook delivery**: Taxa de sucesso

## 🚀 Benefícios Finais

### **Para Performance**
- **Rate limiting inteligente**: Evita sobrecarga
- **S3-only processing**: Sem bottleneck de storage local
- **Fila global otimizada**: Melhor distribuição de carga

### **Para Segurança**
- **Zero local storage**: Sem dados sensíveis em disco
- **Dual monitoring**: Separação dados vs observabilidade
- **Access control**: API keys e validação rigorosa

### **Para Operações**
- **Configuração flexível**: Por instância ou global
- **Monitoramento completo**: Webhooks + métricas
- **Escalabilidade**: Suporta 500+ instâncias

---

**Status**: Arquitetura evoluída e finalizada ✅
**Próximo passo**: Iniciar implementação Sprint 1