# API Reference - Sistema de Fila Global

## 🔗 Endpoints Implementados

### Autenticação

Todos os endpoints requerem autenticação via header `apikey`:

```bash
curl -H "apikey: BQYHJGJHJ" "http://localhost:8080/endpoint"
```

---

## 🎵 Audio Filters Management

### GET /instance/{instance}/filters/audio

Consulta configuração de filtros de áudio para uma instância específica.

**Parâmetros:**
- `instance` (path) - Nome da instância

**Resposta:**
```json
{
  "minDurationSeconds": 3,
  "maxDurationSeconds": 7200,
  "enabled": true
}
```

**Exemplo:**
```bash
curl "http://localhost:8080/instance/minhainstancia/filters/audio" \
  -H "apikey: BQYHJGJHJ"
```

### PUT /instance/{instance}/filters/audio

Atualiza configuração de filtros de áudio para uma instância.

**Parâmetros:**
- `instance` (path) - Nome da instância

**Body:**
```json
{
  "minDurationSeconds": 5,
  "maxDurationSeconds": 300,
  "enabled": true
}
```

**Validações:**
- `minDurationSeconds`: 1-300 segundos
- `maxDurationSeconds`: >= minDurationSeconds e <= 7200 segundos
- `enabled`: boolean

**Resposta:**
```json
{
  "id": 1,
  "instanceName": "minhainstancia",
  "minDurationSeconds": 5,
  "maxDurationSeconds": 300,
  "enabled": true,
  "createdAt": "2025-10-01T10:00:00.000Z",
  "updatedAt": "2025-10-01T10:00:00.000Z"
}
```

**Exemplo:**
```bash
curl -X PUT "http://localhost:8080/instance/minhainstancia/filters/audio" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "minDurationSeconds": 5,
    "maxDurationSeconds": 60,
    "enabled": true
  }'
```

---

## 📊 Queue Statistics

### GET /queue/stats

Consulta estatísticas da fila global e rate limiting.

**Resposta:**
```json
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

**Exemplo:**
```bash
curl "http://localhost:8080/queue/stats" \
  -H "apikey: BQYHJGJHJ"
```

---

## 🧹 S3 Cleanup Management

### GET /cleanup/schedule

Consulta configuração do cleanup automático S3.

**Resposta:**
```json
{
  "enabled": true,
  "retentionDays": 1,
  "dailyTime": "03:00",
  "timezone": "America/Sao_Paulo"
}
```

### PUT /cleanup/schedule

Atualiza configuração do cleanup automático.

**Body:**
```json
{
  "enabled": true,
  "retentionDays": 2,
  "dailyTime": "02:30",
  "timezone": "America/Sao_Paulo"
}
```

**Exemplo:**
```bash
curl -X PUT "http://localhost:8080/cleanup/schedule" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "dailyTime": "02:30",
    "retentionDays": 2,
    "enabled": true
  }'
```

### POST /cleanup/execute

Executa cleanup manual imediato.

**Resposta:**
```json
{
  "success": true,
  "deletedCount": 127,
  "errorCount": 0,
  "executedAt": "2025-10-01T10:00:00.000Z"
}
```

### GET /cleanup/status

Consulta status e próxima execução do cleanup.

**Resposta:**
```json
{
  "enabled": true,
  "nextExecution": "2025-10-02T03:00:00-03:00",
  "retentionDays": 1,
  "lastCleanup": {
    "timestamp": "2025-10-01T03:00:00-03:00",
    "deletedCount": 127,
    "errorCount": 0
  }
}
```

---

## 🔗 Global Webhook Configuration

### GET /webhook/global/config

Consulta configuração atual dos webhooks globais.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "principal": {
      "enabled": false,
      "url": "https://example.com/webhook"
    },
    "monitoramento": {
      "enabled": false,
      "url": "https://monitor.example.com/webhook"
    },
    "webhookByEvents": false,
    "headers": {
      "Authorization": "Bearer token123",
      "X-Custom-Header": "custom-value"
    },
    "createdAt": "2025-10-01T06:55:53.755Z",
    "updatedAt": "2025-10-01T06:55:53.755Z"
  }
}
```

### POST|PUT /webhook/global/config

Cria ou atualiza configuração global de webhooks.

**Body:**
```json
{
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
}
```

**Características:**
- ✅ Atualizações parciais (merge inteligente)
- ✅ Validação automática de URLs
- ✅ Substitui configuração por variáveis de ambiente

### DELETE /webhook/global/config

Desabilita todos os webhooks globais (mantém URLs configuradas).

**Resposta:**
```json
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
      "url": "https://monitor.example.com/webhook"
    },
    "disabledAt": "2025-10-01T06:56:51.686Z"
  }
}
```

### POST /webhook/global/test

Testa conectividade de webhook antes de salvar.

**Body:**
```json
{
  "url": "https://httpbin.org/post",
  "type": "principal"
}
```

**Resposta:**
```json
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
```

---

## 🔄 Processing Feedback System

Sistema de feedback visual para processamento de mensagens em tempo real.

### POST /process/start

Inicia feedback visual com reactions alternadas.

**Body:**
```json
{
  "instance": "minha-instancia",
  "chatId": "5511999999999@s.whatsapp.net",
  "messageId": "msg-12345",
  "processType": "audio-transcription"
}
```

**Resposta:**
```json
{
  "success": true,
  "sessionId": "minha-instancia:5511999999999@s.whatsapp.net:msg-12345",
  "startedAt": "2025-10-01T06:20:00.000Z"
}
```

**Comportamento:**
- ✅ Inicia loop: 🔄 → ⏳ → 🔄 → ⏳ (a cada 3 segundos)
- ✅ Timeout automático: 10 minutos → reaction 🤷 + limpeza

### POST /process/finish

Para o loop de reactions e define reaction final.

**Body:**
```json
{
  "instance": "minha-instancia",
  "chatId": "5511999999999@s.whatsapp.net",
  "messageId": "msg-12345",
  "status": "success",
  "texto": "🎉 Sua transcrição está pronta! O áudio foi processado com sucesso."
}
```

**Status possíveis:**
- `success` → ✅ reaction final
- `error` → ❌ reaction final
- `aborted` → ⚠️ reaction final

**Características:**
- ✅ Para loop automaticamente
- ✅ Envia texto para o chat (se fornecido)
- ✅ Limpa sessão automaticamente
- ✅ Cancela timeout

### GET /process/status

Monitora todas as sessões ativas de processamento.

**Resposta:**
```json
{
  "activeSessionsCount": 2,
  "activeSessions": [
    {
      "sessionId": "instance1:5511999999999@s.whatsapp.net:msg123",
      "instance": "instance1",
      "chatId": "5511999999999@s.whatsapp.net",
      "messageId": "msg123",
      "processType": "audio-transcription",
      "startTime": "2025-10-01T06:20:00.000Z",
      "timeoutAt": "2025-10-01T06:30:00.000Z",
      "currentReaction": 1,
      "runningFor": 120000
    }
  ],
  "stats": {
    "activeCount": 2,
    "totalStarted": 156,
    "averageProcessingTime": 45000
  }
}
```

### DELETE /process/{sessionId}

Força limpeza de uma sessão específica (admin/debug).

**Resposta:**
```json
{
  "success": true,
  "sessionId": "minha-instancia:5511999999999@s.whatsapp.net:msg-12345",
  "cleanedAt": "2025-10-01T06:25:00.000Z"
}
```

---

## 📤 Webhook Payloads

### Webhook Principal (Dados de Negócio)

Enviado para URL configurada em `principal.url`:

```json
{
  "event": "messages.upsert",
  "instance": "minhainstancia",
  "data": {
    "key": {
      "remoteJid": "558199999999@s.whatsapp.net",
      "id": "123"
    },
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

### Webhook Monitoramento (Erros e Estatísticas)

Enviado para URL configurada em `monitoramento.url`:

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

**Eventos de monitoramento:**
- `queue.error` - Erros na fila
- `queue.stats` - Estatísticas periódicas
- `filter.applied` - Filtros aplicados

---

## ⚠️ Códigos de Erro

### 400 Bad Request
- Parâmetros inválidos
- Validação de entrada falhou

### 401 Unauthorized
- API key inválida ou ausente

### 404 Not Found
- Instância não encontrada
- Sessão de processamento não encontrada

### 429 Too Many Requests
- Rate limit excedido

### 500 Internal Server Error
- Erro interno do servidor
- Falha na comunicação com RabbitMQ/S3

---

## 🔧 Configuração de Headers

Todos os endpoints suportam headers customizados configurados em `webhook/global/config`:

```json
{
  "headers": {
    "Authorization": "Bearer your-token",
    "X-Custom-Header": "custom-value",
    "Content-Type": "application/json"
  }
}
```