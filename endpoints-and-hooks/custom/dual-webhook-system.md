<!-- SECTION:HEADER -->
# Sistema Dual Webhook - Evolution API Lite

<!-- SECTION:OVERVIEW -->
## 📋 Resumo

O Sistema Dual Webhook implementa uma arquitetura robusta de webhooks com duas finalidades distintas:

1. **Webhook Principal**: Entrega de dados de negócio (mensagens, eventos)
2. **Webhook Monitoramento**: Erros, estatísticas e observabilidade

<!-- SECTION:COMPONENTS -->
## 🏗️ Componentes Implementados

<!-- COMPONENT:DUAL_WEBHOOK_SERVICE -->
### 1. DualWebhookService
**Arquivo**: `src/api/services/dual-webhook.service.ts`

Responsável pelo envio de webhooks principais e de monitoramento com:
- ✅ Timeout configurável (30s principal, 15s monitoramento)
- ✅ Headers padronizados
- ✅ Logs estruturados
- ✅ Retry automático em caso de falha

<!-- COMPONENT:WEBHOOK_RETRY_SERVICE -->
### 2. WebhookRetryService
**Arquivo**: `src/api/services/webhook-retry.service.ts`

Sistema robusto de retry com:
- ✅ Exponential backoff com jitter
- ✅ 5 tentativas máximas por padrão
- ✅ Códigos HTTP retryáveis configuráveis
- ✅ Monitoramento de falhas permanentes

<!-- COMPONENT:WEBHOOK_LOGGER_SERVICE -->
### 3. WebhookLoggerService
**Arquivo**: `src/api/services/webhook-logger.service.ts`

Sistema de logs e métricas com:
- ✅ Logs estruturados em memória
- ✅ Métricas detalhadas por instância
- ✅ Categorização automática de erros
- ✅ Exportação JSON/CSV

<!-- COMPONENT:WEBHOOK_MONITORING_ROUTER -->
### 4. WebhookMonitoringRouter
**Arquivo**: `src/api/routes/webhook-monitoring.router.ts`

API REST completa para monitoramento.

<!-- SECTION:API_ENDPOINTS -->
## 🔌 Endpoints da API

<!-- SUBSECTION:HEALTH_CHECK -->
### Monitoramento Geral

<!-- ENDPOINT:WEBHOOK_HEALTH -->
#### `GET /webhook/health`
Verifica saúde do sistema de webhooks.

**Resposta**:
```json
{
  "status": "SUCCESS",
  "data": {
    "healthy": true,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "summary": {
      "successRate": 98.5,
      "totalWebhooks": 1500,
      "pendingRetries": 2,
      "avgResponseTime": 245
    },
    "config": {
      "globalWebhookEnabled": true,
      "monitoringWebhookEnabled": true
    }
  }
}
```

<!-- ENDPOINT:WEBHOOK_METRICS -->
#### `GET /webhook/metrics`
Estatísticas detalhadas do sistema.

**Resposta**:
```json
{
  "status": "SUCCESS",
  "metrics": {
    "total": 1500,
    "successful": 1478,
    "failed": 22,
    "retries": 8,
    "averageResponseTime": 245,
    "errorsByType": {
      "timeout": 12,
      "network_error": 6,
      "server_error": 4
    },
    "instanceStats": {
      "instance1": {
        "total": 500,
        "successful": 495,
        "failed": 5
      }
    },
    "retry": {
      "pending": 2,
      "totalFailed": 22,
      "averageAttempts": 2.1
    },
    "summary": {
      "successRate": 98.5,
      "errorRate": 1.5,
      "retryRate": 0.5
    }
  }
}
```

<!-- SUBSECTION:LOGS_AUDIT -->
### Logs e Auditoria

<!-- ENDPOINT:WEBHOOK_LOGS -->
#### `GET /webhook/logs`
Busca logs recentes com filtros opcionais.

**Parâmetros**:
- `limit` (opcional): Número de logs (padrão: 100)
- `type` (opcional): `errors` para apenas erros
- `instance` (opcional): Filtrar por instância específica

**Resposta**:
```json
{
  "status": "SUCCESS",
  "data": {
    "logs": [
      {
        "timestamp": "2024-01-15T10:30:00.000Z",
        "type": "main",
        "event": "messages.upsert",
        "instance": "instance1",
        "webhookUrl": "https://webhook.example.com/events",
        "result": {
          "success": true,
          "statusCode": 200,
          "responseTime": 245
        },
        "metadata": {
          "attempt": 1,
          "queueSize": 5
        }
      }
    ],
    "total": 100
  }
}
```

<!-- ENDPOINT:WEBHOOK_LOGS_EXPORT -->
#### `GET /webhook/logs/export?format=json|csv`
Exporta todos os logs em JSON ou CSV.

<!-- SUBSECTION:FAILED_RETRY -->
### Falhas e Retry

<!-- ENDPOINT:WEBHOOK_FAILED -->
#### `GET /webhook/failed`
Lista webhooks que falharam e estão aguardando retry.

**Resposta**:
```json
{
  "status": "SUCCESS",
  "data": {
    "failedWebhooks": [
      {
        "id": "abc123",
        "payload": { "event": "messages.upsert", "instance": "test" },
        "webhookUrl": "https://webhook.example.com/down",
        "attempts": 3,
        "lastAttempt": "2024-01-15T10:25:00.000Z",
        "nextRetry": "2024-01-15T10:35:00.000Z",
        "lastError": "Connection timeout",
        "lastStatusCode": 408
      }
    ],
    "total": 1
  }
}
```

<!-- ENDPOINT:DELETE_FAILED_WEBHOOK -->
#### `DELETE /webhook/failed/:webhookId`
Remove um webhook específico da fila de retry.

<!-- ENDPOINT:DELETE_ALL_FAILED -->
#### `DELETE /webhook/failed`
Limpa todos os webhooks falhados.

<!-- SUBSECTION:TEST_DIAGNOSTIC -->
### Testes e Diagnóstico

<!-- ENDPOINT:WEBHOOK_TEST -->
#### `POST /webhook/test`
Testa conectividade com um webhook específico.

**Body**:
```json
{
  "url": "https://webhook.example.com/test",
  "payload": {
    "event": "test.webhook",
    "instance": "test",
    "data": { "message": "Teste de conectividade" }
  }
}
```

**Resposta**:
```json
{
  "status": "SUCCESS",
  "data": {
    "success": true,
    "statusCode": 200,
    "responseTime": 234,
    "error": null
  }
}
```

<!-- SUBSECTION:MAINTENANCE -->
### Manutenção

<!-- ENDPOINT:DELETE_LOGS -->
#### `DELETE /webhook/logs`
Limpa todos os logs e métricas.

<!-- SECTION:CONFIGURATION -->
## 🔧 Configuração

### Variáveis de Ambiente

```env
# Webhook Global (Principal)
WEBHOOK_GLOBAL_ENABLED=true
WEBHOOK_GLOBAL_URL=https://seu-webhook.com/events

# Webhook Monitoramento
WEBHOOK_MONITORING_ENABLED=true
WEBHOOK_MONITORING_URL=https://seu-webhook.com/monitoring

# Rate Limiting (se aplicável)
GLOBAL_QUEUE_ENABLED=true
GLOBAL_QUEUE_RATE_LIMIT=500
```

<!-- SUBSECTION:PAYLOAD_PRINCIPAL -->
### Estrutura do Payload Principal

```json
{
  "event": "messages.upsert",
  "instance": "minha-instancia",
  "data": {
    "key": { "remoteJid": "5511999999999@s.whatsapp.net", "id": "msg123" },
    "message": { "conversation": "Olá mundo!" },
    "audioUrl": "https://s3.example.com/audio/123.mp3",
    "audioDuration": 15,
    "mimeType": "audio/mpeg"
  },
  "server_url": "http://localhost:8080",
  "apikey": "sua-chave-api",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

<!-- SUBSECTION:PAYLOAD_MONITORING -->
### Estrutura do Payload Monitoramento

```json
{
  "event": "queue.stats",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "instance": "minha-instancia",
  "data": {
    "queueSize": 42,
    "processedCount": 1500,
    "audioFilterStats": {
      "tooShort": 23,
      "tooLong": 8,
      "processed": 156
    }
  },
  "server_url": "http://localhost:8080"
}
```

<!-- SECTION:TESTING -->
## 🧪 Testes

Execute os testes automatizados:

```bash
node test-dual-webhook.js
```

<!-- SECTION:MONITORING -->
## 📊 Monitoramento

### Códigos de Status de Saúde
- **Healthy**: Taxa de sucesso ≥ 95% e < 100 retries pendentes
- **Unhealthy**: Taxa de sucesso < 95% ou ≥ 100 retries pendentes

### Categorias de Erro
- `client_error`: HTTP 4xx
- `server_error`: HTTP 5xx
- `timeout`: Timeouts de conexão
- `network_error`: Erros de rede/DNS
- `rate_limit_or_timeout`: HTTP 408, 429
- `unknown_error`: Outros erros

<!-- SECTION:RETRY_LOGIC -->
## 🔄 Retry Logic

1. **Códigos Retryáveis**: 408, 429, 500, 502, 503, 504
2. **Máximo de Tentativas**: 5 (configurável)
3. **Backoff**: Exponencial com jitter
4. **Intervalos**: 1s, 2s, 4s, 8s, 16s (até 5min máximo)

<!-- SECTION:STATUS -->
## ✅ Status da Implementação

- ✅ Webhook Principal implementado
- ✅ Webhook Monitoramento implementado
- ✅ Sistema de Retry robusto
- ✅ Logs estruturados
- ✅ API REST completa
- ✅ Testes automatizados
- ✅ Documentação técnica

O sistema está pronto para uso em produção e totalmente compatível com a arquitetura Evolution API existente!