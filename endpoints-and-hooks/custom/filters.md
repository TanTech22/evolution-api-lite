<!-- SECTION:HEADER -->
# 🤖 Sistema de Filtros de Segurança - Evolution API Lite (Consolidado para IA)

> **Documento consolidado otimizado para consumo de ferramentas de Inteligência Artificial**
>
> **Versão**: 2.2.1 | **Data**: 2025-10-01 | **Ambiente**: Evolution API Lite

<!-- SECTION:OVERVIEW -->
## 📋 Visão Geral

O sistema de filtros de segurança da Evolution API Lite oferece **controle total sobre mensagens** através de filtros aplicados **antes de qualquer persistência**. Mensagens que não passam nos filtros são **completamente descartadas** sem armazenamento.

### 🔒 Características de Segurança

- **Filtros aplicados ANTES da persistência** - zero armazenamento de dados rejeitados
- **Descarte completo** - mensagens bloqueadas não geram logs ou cache
- **Fallback automático** - configuração padrão em caso de erro
- **Performance otimizada** - filtros em memória com early return
- **Auditoria completa** - logs de segurança para monitoramento

### ⚡ Sistema Harmonizado (Novo)

- **Fila global** com rate limiting
- **Webhook dual system** (principal + monitoramento)
- **Filtros de duração de áudio** configuráveis por instância
- **Feedback automático** diferenciado por tipo de filtro
- **Cleanup S3** automatizado

---

<!-- SECTION:CONFIG_REFERENCE -->
## 🎯 Estrutura de Configuração (REFERÊNCIA OFICIAL)

### ✅ Estrutura Correta de Filtros

```json
{
  "instanceName": "nome-da-instancia",
  "integration": "WHATSAPP-BAILEYS",
  "audioFilters": {  // OPCIONAL - Criado automaticamente se não fornecido
    "enabled": true,
    "minDurationSeconds": 5,
    "maxDurationSeconds": 180,
    "replyToOversizeAudio": true,
    "oversizeReaction": "⸘"
  },
  "webhook": {
    "enabled": true,
    "url": "https://seu-webhook.com/receive",
    "events": ["MESSAGES_UPSERT", "SEND_MESSAGE"],

    // EVENTOS DISPONÍVEIS (enum string[] required)
    // APPLICATION_STARTUP, QRCODE_UPDATED, MESSAGES_SET, MESSAGES_UPSERT,
    // MESSAGES_UPDATE, MESSAGES_DELETE, SEND_MESSAGE, CONTACTS_SET,
    // CONTACTS_UPSERT, CONTACTS_UPDATE, PRESENCE_UPDATE, CHATS_SET,
    // CHATS_UPSERT, CHATS_UPDATE, CHATS_DELETE, GROUPS_UPSERT,
    // GROUP_UPDATE, GROUP_PARTICIPANTS_UPDATE, CONNECTION_UPDATE,
    // CALL, NEW_JWT_TOKEN, TYPEBOT_START, TYPEBOT_CHANGE_STATUS

    // FILTROS POR TIPO DE MENSAGEM
    "messageTypes": ["conversation", "audioMessage"],
    "excludeMessageTypes": ["imageMessage", "videoMessage"],

    // FILTROS DE TEXTO
    "textFilters": {
      "allowedWords": ["suporte", "help", "ajuda"],
      "blockedWords": ["spam", "golpe", "promoção"],
      "allowedPatterns": ["^[!/]", "^#ticket"],
      "blockedPatterns": ["\\\\d{11}", "www\\\\.", "http"]
    },

    // FILTROS DE ÁUDIO (ESTRUTURA ÚNICA)
    "audioProcessing": {
      "maxSizeBytes": 25165824,           // 24MB - LIMITE FIXO GLOBAL
      "minDurationSeconds": 3,            // Duração mínima (configurável)
      "maxDurationSeconds": 300,          // Duração máxima (configurável)
      "replyToOversizeAudio": true,       // Controla feedback para tamanho + duração
      "oversizeReaction": "⸘"            // Reaction personalizada para áudios inválidos
    }
  }
}
```

### 🔄 Sistema de Feedback Diferenciado

| Filtro | Tipo de Feedback | Configurável | Descrição |
|--------|------------------|--------------|-----------|
| **Tamanho > 24MB** | Reaction ⛔ | ❌ Não | Limite técnico global fixo |
| **Duração inválida** | Reaction personalizada | ✅ Sim | Via `oversizeReaction` e `replyToOversizeAudio` |
| **Outros filtros** | Descarte silencioso | ❌ Não | Sem feedback ao usuário |

---

<!-- SECTION:API_ENDPOINTS -->
## 📡 Endpoints da API

<!-- SUBSECTION:INSTANCES -->
### 🏢 Instâncias com Filtros

<!-- ENDPOINT:CREATE_INSTANCE -->
#### `POST /instance/create`
> Cria instância com filtros avançados configurados e registro automático de filtros de áudio

**🆕 Funcionalidades de Audio Filters na Criação**:
- **Criação automática**: Sempre cria registro de filtros de áudio
- **Valores personalizados**: Aceita configuração via `audioFilters` no body
- **Defaults inteligentes**: Usa variáveis de ambiente ou valores padrão
- **Persistência garantida**: Salvos no banco de dados SQLite

**Headers obrigatórios:**
```http
Content-Type: application/json
apikey: sua-chave-api
```

**Exemplo completo com audioFilters:**
```bash
curl -X POST "https://localhost:8080/instance/create" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "instanceName": "bot-atendimento",
    "integration": "WHATSAPP-BAILEYS",
    "audioFilters": {
      "enabled": true,
      "minDurationSeconds": 10,
      "maxDurationSeconds": 120,
      "replyToOversizeAudio": true,
      "oversizeReaction": "⸘"
    },
    "webhook": {
      "enabled": true,
      "url": "https://meusite.com/webhook-whatsapp",
      "events": ["MESSAGES_UPSERT", "SEND_MESSAGE"],
      "messageTypes": ["conversation", "audioMessage"],
      "excludeMessageTypes": ["imageMessage", "videoMessage"],
      "textFilters": {
        "allowedWords": ["suporte", "help", "ajuda", "atendimento"],
        "blockedWords": ["spam", "golpe", "promoção", "desconto"],
        "allowedPatterns": ["^[!/]", "^#ticket"],
        "blockedPatterns": ["\\\\d{11}", "www\\\\.", "http", "bit\\\\.ly"]
      },
      "audioProcessing": {
        "maxSizeBytes": 25165824,
        "minDurationSeconds": 3,
        "maxDurationSeconds": 300,
        "replyToOversizeAudio": true,
        "oversizeReaction": "⸘"
      }
    }
  }'
```

**Resposta de sucesso:**
```json
{
  "status": "SUCCESS",
  "response": {
    "instanceName": "bot-atendimento",
    "qrcode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...",
    "integration": "WHATSAPP-BAILEYS",
    "webhook": {
      "enabled": true,
      "url": "https://meusite.com/webhook-whatsapp"
    },
    "message": "Instance created successfully. Scan QR code to connect."
  }
}
```

---

<!-- ENDPOINT:GET_FILTERS -->
#### `GET /instance/filters/{instanceName}`
> Consulta filtros atuais de uma instância

**Exemplo:**
```bash
curl "https://localhost:8080/instance/filters/bot-atendimento" \
  -H "apikey: BQYHJGJHJ"
```

**Resposta completa:**
```json
{
  "status": "SUCCESS",
  "response": {
    "instanceName": "bot-atendimento",
    "currentFilters": {
      "webhook": {
        "enabled": true,
        "url": "https://meusite.com/webhook-whatsapp",
        "events": ["MESSAGES_UPSERT", "SEND_MESSAGE"],
        "messageTypes": ["conversation", "audioMessage"],
        "excludeMessageTypes": ["imageMessage", "videoMessage"],
        "textFilters": {
          "allowedWords": ["suporte", "help", "ajuda"],
          "blockedWords": ["spam", "golpe", "promoção"],
          "allowedPatterns": ["^[!/]", "^#ticket"],
          "blockedPatterns": ["\\\\d{11}", "www\\\\.", "http"]
        },
        "audioProcessing": {
          "maxSizeBytes": 25165824,
          "minDurationSeconds": 3,
          "maxDurationSeconds": 300,
          "replyToOversizeAudio": true,
          "oversizeReaction": "⸘"
        }
      }
    },
    "availableMessageTypes": [
      "conversation", "extendedTextMessage", "audioMessage",
      "imageMessage", "videoMessage", "documentMessage",
      "contactMessage", "locationMessage", "listResponseMessage",
      "templateButtonReplyMessage", "stickerMessage", "ptvMessage"
    ],
    "appliedAt": "2025-10-01T10:30:00.000Z"
  }
}
```

---

<!-- ENDPOINT:UPDATE_FILTERS -->
#### `PUT /instance/filters/{instanceName}`
> Atualiza filtros de instância existente

**Exemplo de atualização:**
```bash
curl -X PUT "https://localhost:8080/instance/filters/bot-atendimento" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "webhook": {
      "messageTypes": ["conversation", "audioMessage", "documentMessage"],
      "excludeMessageTypes": ["imageMessage", "videoMessage", "stickerMessage"],
      "textFilters": {
        "allowedPatterns": ["^[!/]", "^@bot", "^suporte"],
        "blockedWords": ["spam", "golpe", "promoção", "desconto"]
      },
      "audioProcessing": {
        "minDurationSeconds": 5,
        "maxDurationSeconds": 120,
        "replyToOversizeAudio": true,
        "oversizeReaction": "⸘"
      }
    }
  }'
```

**Resposta:**
```json
{
  "status": "SUCCESS",
  "response": {
    "message": "Instance filters updated successfully",
    "instanceName": "bot-atendimento",
    "updatedFilters": {
      "messageTypes": ["conversation", "audioMessage", "documentMessage"],
      "textFilters": {
        "allowedPatterns": ["^[!/]", "^@bot", "^suporte"]
      },
      "audioProcessing": {
        "minDurationSeconds": 5,
        "maxDurationSeconds": 120
      }
    },
    "appliedAt": "2025-10-01T12:00:00.000Z"
  }
}
```

---

<!-- SUBSECTION:AUDIO_FILTERS -->
### 🎵 Filtros Específicos de Áudio

<!-- ENDPOINT:GET_AUDIO_FILTERS -->
#### `GET /instance/filters/audio/{instanceName}`
> Consulta configurações específicas de filtros de áudio

**📝 Nota**: Toda instância possui filtros de áudio configurados desde sua criação

**Exemplo:**
```bash
curl "https://localhost:8080/instance/filters/audio/bot-atendimento" \
  -H "apikey: BQYHJGJHJ"
```

**Resposta:**
```json
{
  "status": "SUCCESS",
  "response": {
    "instanceName": "bot-atendimento",
    "audioFilters": {
      "id": 1,
      "instanceName": "bot-atendimento",
      "enabled": true,
      "minDurationSeconds": 3,
      "maxDurationSeconds": 300,
      "replyToOversizeAudio": true,
      "oversizeReaction": "⸘",
      "createdAt": "2025-10-01T10:30:00.000Z",
      "updatedAt": "2025-10-01T10:30:00.000Z"
    },
    "statistics": {
      "totalAudiosProcessed": 156,
      "filteredByDuration": 23,
      "filteredBySize": 8,
      "successfullyProcessed": 125
    },
    "lastUpdated": "2025-10-01T10:30:00.000Z"
  }
}
```

---

<!-- ENDPOINT:UPDATE_AUDIO_FILTERS -->
#### `PUT /instance/filters/audio/{instanceName}`
> Atualiza configurações de filtros de áudio existentes

**🔄 Comportamento**:
- Atualiza registro existente (criado automaticamente na criação da instância)
- Operação `upsert`: cria se não existir (casos de migração)

**Parâmetros aceitos:**
- `minDurationSeconds`: 1-7200 (duração mínima em segundos)
- `maxDurationSeconds`: 1-7200 (duração máxima em segundos)
- `enabled`: true/false (habilitar filtros)
- `replyToOversizeAudio`: true/false (enviar feedback)
- `oversizeReaction`: string (reaction personalizada para áudios inválidos)

**Exemplo:**
```bash
curl -X PUT "https://localhost:8080/instance/filters/audio/bot-atendimento" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "enabled": true,
    "minDurationSeconds": 5,
    "maxDurationSeconds": 60,
    "replyToOversizeAudio": true,
    "oversizeReaction": "⸘"
  }'
```

**Resposta:**
```json
{
  "status": "SUCCESS",
  "response": {
    "message": "Audio filters updated successfully",
    "instanceName": "bot-atendimento",
    "updatedConfig": {
      "enabled": true,
      "minDurationSeconds": 5,
      "maxDurationSeconds": 60,
      "replyToOversizeAudio": true
    },
    "appliedAt": "2025-10-01T12:15:00.000Z"
  }
}
```

---

<!-- ENDPOINT:GET_AUDIO_STATS -->
#### `GET /instance/filters/audio/stats/{instanceName}`
> Estatísticas detalhadas dos filtros de áudio

**Exemplo:**
```bash
curl "https://localhost:8080/instance/filters/audio/stats/bot-atendimento" \
  -H "apikey: BQYHJGJHJ"
```

**Resposta:**
```json
{
  "status": "SUCCESS",
  "response": {
    "instanceName": "bot-atendimento",
    "period": {
      "startDate": "2025-10-01T00:00:00.000Z",
      "endDate": "2025-10-01T23:59:59.999Z"
    },
    "audioStats": {
      "totalReceived": 189,
      "successfullyProcessed": 156,
      "filtered": {
        "tooShort": 23,
        "tooLong": 8,
        "sizeExceeded": 2,
        "total": 33
      },
      "successRate": 82.54,
      "filterRate": 17.46
    },
    "durationAnalysis": {
      "averageDuration": 45.3,
      "shortestDuration": 1.2,
      "longestDuration": 287.5,
      "mostCommonRange": "10-30 seconds"
    },
    "sizeAnalysis": {
      "averageSize": 3456789,
      "averageSizeMB": 3.3,
      "largestSize": 26214400,
      "largestSizeMB": 25.0
    },
    "lastReset": "2025-10-01T00:00:00.000Z"
  }
}
```

---

<!-- ENDPOINT:RESET_AUDIO_STATS -->
#### `POST /instance/filters/audio/stats/reset/{instanceName}`
> Zera estatísticas de filtros de áudio

**Exemplo:**
```bash
curl -X POST "https://localhost:8080/instance/filters/audio/stats/reset/bot-atendimento" \
  -H "apikey: BQYHJGJHJ"
```

**Resposta:**
```json
{
  "status": "SUCCESS",
  "response": {
    "message": "Audio filter statistics reset successfully",
    "instanceName": "bot-atendimento",
    "resetAt": "2025-10-01T12:30:00.000Z",
    "previousStats": {
      "totalProcessed": 156,
      "totalFiltered": 33
    }
  }
}
```

---

<!-- SUBSECTION:GLOBAL_QUEUE -->
### 📊 Sistema de Fila Global

<!-- ENDPOINT:GET_QUEUE_STATS -->
#### `GET /queue/stats`
> Estatísticas em tempo real da fila global

**Exemplo:**
```bash
curl "https://localhost:8080/queue/stats" \
  -H "apikey: BQYHJGJHJ"
```

**Resposta completa:**
```json
{
  "status": "SUCCESS",
  "response": {
    "timestamp": "2025-10-01T13:15:00.000Z",
    "queue": {
      "currentSize": 42,
      "maxSize": 10000,
      "utilizationPercent": 0.42
    },
    "processing": {
      "processedToday": 15847,
      "processedThisHour": 1247,
      "averageProcessingTime": 245,
      "throughputPerMinute": 20.8
    },
    "rateLimiting": {
      "tokensAvailable": 245,
      "totalCapacity": 500,
      "utilizationPercent": 51.0,
      "refillRate": "500 tokens/minute",
      "timeToRefill": 30.6
    },
    "audioProcessing": {
      "totalProcessed": 156,
      "successfullyProcessed": 125,
      "filteredStats": {
        "tooShort": 23,
        "tooLong": 8,
        "sizeExceeded": 5
      },
      "successRate": 80.13
    },
    "globalWebhook": {
      "url": "https://your-supabase.co/functions/v1/webhook",
      "enabled": true,
      "lastDelivery": "2025-10-01T13:14:45.000Z",
      "deliveryRate": 98.5
    },
    "system": {
      "maxAudioSize": "24MB",
      "defaultMinDuration": 3,
      "defaultMaxDuration": 300
    }
  }
}
```

---

<!-- SUBSECTION:DUAL_WEBHOOK -->
### 🔄 Sistema Dual Webhook

<!-- ENDPOINT:GET_WEBHOOK_CONFIG -->
#### `GET /webhook/global/config`
> Consulta configuração dos webhooks globais

**Exemplo:**
```bash
curl "https://localhost:8080/webhook/global/config" \
  -H "apikey: BQYHJGJHJ"
```

**Resposta (configurado):**
```json
{
  "success": true,
  "data": {
    "principal": {
      "enabled": true,
      "url": "https://meusite.com/webhook-principal"
    },
    "monitoramento": {
      "enabled": true,
      "url": "https://monitor.meusite.com/webhook-stats"
    },
    "webhookByEvents": true,
    "headers": {
      "Authorization": "Bearer token123456",
      "X-Custom-Header": "evolution-api",
      "Content-Type": "application/json"
    },
    "timeout": {
      "principal": 30000,
      "monitoramento": 15000
    },
    "retry": {
      "enabled": true,
      "maxAttempts": 5,
      "backoffMultiplier": 2
    },
    "statistics": {
      "lastDelivery": "2025-10-01T14:18:30.000Z",
      "totalDeliveries": 1589,
      "failureRate": 1.2
    },
    "createdAt": "2025-09-15T10:30:00.000Z",
    "updatedAt": "2025-10-01T12:00:00.000Z",
    "createdBy": "admin@empresa.com"
  }
}
```

---

<!-- ENDPOINT:POST_WEBHOOK_CONFIG -->
#### `POST /webhook/global/config`
> Cria ou atualiza configuração global de webhooks

**Exemplo completo:**
```bash
curl -X POST "https://localhost:8080/webhook/global/config" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "principal": {
      "enabled": true,
      "url": "https://meusite.com/webhook-principal"
    },
    "monitoramento": {
      "enabled": true,
      "url": "https://monitor.meusite.com/webhook-stats"
    },
    "webhookByEvents": true,
    "headers": {
      "Authorization": "Bearer sua-api-key-aqui",
      "X-Custom-Header": "evolution-api-lite",
      "X-Version": "2.2.1"
    }
  }'
```

**Resposta:**
```json
{
  "success": true,
  "message": "Global webhook configuration updated successfully",
  "data": {
    "principal": {
      "enabled": true,
      "url": "https://meusite.com/webhook-principal"
    },
    "monitoramento": {
      "enabled": true,
      "url": "https://monitor.meusite.com/webhook-stats"
    },
    "webhookByEvents": true,
    "headers": {
      "Authorization": "Bearer sua-api-key-aqui",
      "X-Custom-Header": "evolution-api-lite",
      "X-Version": "2.2.1"
    },
    "validation": {
      "principalUrlValid": true,
      "monitoramentoUrlValid": true,
      "headersValid": true
    },
    "createdAt": "2025-10-01T14:20:00.000Z",
    "updatedAt": "2025-10-01T14:20:00.000Z"
  }
}
```

---

<!-- SECTION:PRACTICAL_SCENARIOS -->
## 🎯 Cenários Práticos de Uso

<!-- SCENARIO:BOT_COMMANDS -->
### 1. Bot de Comandos (Apenas Texto com Prefixo)

**Configuração:**
```json
{
  "webhook": {
    "messageTypes": ["conversation"],
    "textFilters": {
      "allowedPatterns": ["^[!/]"]
    }
  }
}
```

**Comportamento:**
- ✅ Aceita: `/help`, `!status`, `!/comando`
- ❌ Rejeita: `oi tudo bem`, `olá`

---

<!-- SCENARIO:SUPPORT_AUDIO_SILENT -->
### 2. Suporte com Áudios (Descarte Silencioso)

**Configuração:**
```json
{
  "webhook": {
    "messageTypes": ["conversation", "audioMessage", "documentMessage"],
    "textFilters": {
      "allowedWords": ["suporte", "help", "problema"]
    },
    "audioProcessing": {
      "maxSizeBytes": 25165824,
      "minDurationSeconds": 3,
      "maxDurationSeconds": 60,
      "replyToOversizeAudio": false
    }
  }
}
```

**Comportamento:**
- ✅ Áudio 3-60s: Processado normalmente
- ❌ Áudio <3s ou >60s: Descartado silenciosamente (sem resposta)
- ❌ Áudio >24MB: Reaction ⛔ automática

---

<!-- SCENARIO:SUPPORT_AUDIO_FEEDBACK -->
### 3. Suporte com Feedback ao Cliente

**Configuração:**
```json
{
  "webhook": {
    "messageTypes": ["audioMessage"],
    "audioProcessing": {
      "maxSizeBytes": 25165824,
      "minDurationSeconds": 5,
      "maxDurationSeconds": 60,
      "replyToOversizeAudio": true,
        "oversizeReaction": "⸘"
    }
  }
}
```

**Comportamento:**
- ✅ Áudio 5-60s: Processado normalmente
- ❌ Áudio <5s: Envia mensagem de texto personalizada
- ❌ Áudio >60s: Envia mensagem de texto personalizada
- ❌ Áudio >24MB: Reaction ⛔ + possível mensagem

---

<!-- SCENARIO:ANTI_SPAM -->
### 4. Anti-Spam Rigoroso

**Configuração:**
```json
{
  "webhook": {
    "messageTypes": ["conversation"],
    "textFilters": {
      "blockedWords": ["spam", "promoção", "desconto", "oferta"],
      "blockedPatterns": ["\\\\d{10,}", "www\\\\.", "http", "bit\\\\.ly"]
    }
  }
}
```

**Comportamento:**
- ✅ Aceita: `preciso de ajuda`, `como funciona`
- ❌ Rejeita: `promoção especial`, `www.site.com`, `11987654321`

---

<!-- SCENARIO:MEDIA_ONLY -->
### 5. Apenas Mídias (Sem Texto)

**Configuração:**
```json
{
  "webhook": {
    "messageTypes": ["imageMessage", "videoMessage", "documentMessage"],
    "excludeMessageTypes": ["conversation", "audioMessage"]
  }
}
```

**Comportamento:**
- ✅ Aceita: Imagens, vídeos, documentos
- ❌ Rejeita: Textos e áudios

---

<!-- SECTION:WEBHOOK_EXAMPLES -->
## 📤 Exemplos de Payload dos Webhooks

<!-- WEBHOOK:PRINCIPAL -->
### 🎯 Webhook Principal (Dados de Negócio)

```json
{
  "event": "messages.upsert",
  "instance": "bot-atendimento",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "msg-123456"
    },
    "message": {
      "conversation": "Preciso de ajuda com suporte"
    },
    "messageTimestamp": 1696176000,
    "audioUrl": "https://s3.minio.com/evolution/audio_1696176000000.ogg",
    "audioDuration": 15,
    "mimeType": "audio/ogg; codecs=opus"
  },
  "server_url": "https://localhost:8080",
  "apikey": "BQYHJGJHJ",
  "timestamp": "2025-10-01T15:30:00.000Z"
}
```

<!-- WEBHOOK:MONITORING -->
### 📊 Webhook Monitoramento (Estatísticas)

```json
{
  "event": "queue.stats",
  "timestamp": "2025-10-01T15:30:00.000Z",
  "instance": null,
  "data": {
    "queueSize": 42,
    "processedCount": 1589,
    "audioFilterStats": {
      "tooShort": 23,
      "tooLong": 8,
      "processed": 156
    },
    "rateLimitStatus": {
      "tokens": 245,
      "capacity": 500
    }
  },
  "server_url": "https://localhost:8080"
}
```

---

<!-- SECTION:MESSAGE_TYPES -->
## 🔍 Tipos de Mensagem Disponíveis

| Tipo | Descrição | Uso Comum |
|------|-----------|-----------|
| `conversation` | Texto simples | Mensagens de texto básicas |
| `extendedTextMessage` | Texto com formatação | Texto com negrito, itálico, links |
| `audioMessage` | Áudio/voz | Mensagens de voz do WhatsApp |
| `imageMessage` | Imagem | Fotos e imagens |
| `videoMessage` | Vídeo | Vídeos e GIFs |
| `documentMessage` | Documento | PDFs, DOCs, planilhas |
| `contactMessage` | Contato | Cartão de visita |
| `locationMessage` | Localização | Coordenadas GPS |
| `listResponseMessage` | Resposta de lista | Seleção em lista interativa |
| `templateButtonReplyMessage` | Resposta de botão | Clique em botão interativo |
| `stickerMessage` | Sticker | Figurinhas animadas |
| `ptvMessage` | Vídeo em círculo | Vídeos em formato circular |
| `viewOnceMessageV2` | Mensagem que desaparece | Mídia que desaparece após visualização |
| `documentWithCaptionMessage` | Documento com legenda | Arquivo com texto descritivo |

---

<!-- SECTION:ERROR_CODES -->
## ⚠️ Códigos de Resposta da API

### ✅ Respostas de Sucesso

**200 OK - Operação realizada:**
```json
{
  "status": "SUCCESS",
  "response": {
    // dados da resposta
  }
}
```

### ❌ Respostas de Erro

**400 Bad Request - Dados inválidos:**
```json
{
  "status": "ERROR",
  "error": true,
  "response": {
    "message": "Invalid message types provided",
    "details": ["imageMessage is not a valid type"]
  }
}
```

**401 Unauthorized - API key inválida:**
```json
{
  "status": "ERROR",
  "error": true,
  "response": {
    "message": "Unauthorized",
    "code": "MISSING_API_KEY"
  }
}
```

**404 Not Found - Instância não encontrada:**
```json
{
  "status": "ERROR",
  "error": true,
  "response": {
    "message": "Instance 'bot-inexistente' not found"
  }
}
```

---

<!-- SECTION:AUTHENTICATION -->
## 🔐 Autenticação

### Header Obrigatório
```http
apikey: sua-chave-api
```

### Configuração
```env
AUTHENTICATION_API_KEY_KEY=sua-chave-aqui
```

---

<!-- SECTION:AI_WORKFLOW -->
## 🚀 Workflow Recomendado para IA

### 1. **Criação de Instância**
```bash
# Criar instância com filtros (audioFilters são criados automaticamente)
POST /instance/create

# Com audioFilters personalizados:
{
  "instanceName": "bot",
  "audioFilters": {
    "minDurationSeconds": 10,
    "maxDurationSeconds": 60
  }
}

# Sem audioFilters (usa defaults 3-300s):
{
  "instanceName": "bot"
}

# Verificar se conectou
GET /instance/{instanceName}/connectionState
```

### 2. **Ajuste de Filtros**
```bash
# Ver filtros atuais
GET /instance/filters/{instanceName}

# Ajustar se necessário
PUT /instance/filters/{instanceName}
```

### 3. **Monitoramento**
```bash
# Estatísticas de filtros
GET /instance/filters/{instanceName}/audio/stats

# Métricas gerais
GET /instance/{instanceName}/metrics

# Status da fila
GET /queue/stats
```

### 4. **Webhook Global (Opcional)**
```bash
# Configurar webhook global
POST /webhook/global/config

# Verificar saúde
GET /webhook/health
```

---

<!-- SECTION:AI_MAPPING -->
## 🎯 Mapeamento para Prompts de IA

### Para Configurar Filtros:
1. **Identifique o objetivo**: Bot de comandos, suporte, anti-spam, etc.
2. **Escolha os tipos de mensagem**: `messageTypes` ou `excludeMessageTypes`
3. **Configure filtros de texto**: `allowedWords`, `blockedWords`, `allowedPatterns`, `blockedPatterns`
4. **Ajuste filtros de áudio**:
   - Na criação: via `audioFilters` no body (opcional)
   - Após criação: via `PUT /instance/filters/audio/{instanceName}`
   - Variáveis de ambiente: `AUDIO_FILTER_ENABLED`, `AUDIO_MIN_DURATION`, `AUDIO_MAX_DURATION`

### Para Monitorar:
1. **Verifique estatísticas**: `/filters/audio/stats`
2. **Monitore performance**: `/metrics`
3. **Acompanhe fila**: `/queue/stats`

### Para Troubleshooting:
1. **Logs de webhook**: `/webhook/logs`
2. **Falhas de webhook**: `/webhook/failed`
3. **Status de conexão**: `/connectionState`