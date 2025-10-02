# 📋 Documentação Completa de Endpoints - Evolution API Lite

> Esta documentação abrange todos os endpoints disponíveis na Evolution API Lite, incluindo funcionalidades originais e extensões customizadas implementadas.

## 🔍 Visão Geral

A **Evolution API Lite** oferece uma API completa para integração com WhatsApp, incluindo:

| Funcionalidade | Descrição |
|---|---|
| **🏢 Gerenciamento de Instâncias** | Criação, configuração e controle de instâncias WhatsApp |
| **🔧 Sistema de Filtros Avançados** | Filtros por tipo de mensagem, conteúdo e duração de áudio |
| **🔄 Webhook Dual System** | Sistema robusto de webhooks com monitoramento separado |
| **📊 Fila Global** | Controle de rate limiting e processamento em massa |
| **⏳ Feedback de Processamento** | Sistema visual de feedback para operações longas |
| **🗂️ Cleanup S3** | Gerenciamento automático de arquivos de mídia |

---

## 📚 Índice

- [Instâncias](#-instâncias)
- [Funcionalidades Básicas](#funcionalidades-básicas)
- [Funcionalidades Avançadas](#funcionalidades-avançadas-customizadas)
- [Sistema de Fila Global](#-sistema-de-fila-global)
- [Sistema Dual Webhook](#-sistema-dual-webhook)
- [Monitoramento de Saúde](#monitoramento-de-saúde)
- [Logs e Auditoria](#logs-e-auditoria)
- [Sistema de Falhas e Retry](#sistema-de-falhas-e-retry)
- [Testes de Conectividade](#testes-de-conectividade)
- [Configuração Global de Webhooks](#-configuração-global-de-webhooks)
- [Sistema de Feedback de Processamento](#-sistema-de-feedback-de-processamento)
- [Sistema de Cleanup S3](#️-sistema-de-cleanup-s3)
- [Autenticação](#-autenticação)
- [Exemplos Práticos](#-exemplos-práticos)

---

## 🏢 Instâncias

### Funcionalidades Básicas

#### `POST /instance/create`

> **Finalidade**: Cria uma nova instância WhatsApp com configurações avançadas de filtros e configuração automática de filtros de áudio.

**⚡ Quando usar**:
- Primeira vez conectando um número WhatsApp
- Configurar filtros específicos desde o início
- Definir webhooks e processamento de mídia
- Configurar filtros de áudio personalizados na criação

**📋 Headers**:
```http
Content-Type: application/json
apikey: sua-chave-api
```

**📤 Exemplo de Chamada Completo**:
```bash
curl -X POST "https://localhost:8080/instance/create" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "instanceName": "bot-atendimento",
    "integration": "WHATSAPP-BAILEYS",
    "audioFilters": {
      "enabled": true,
      "minDurationSeconds": 5,
      "maxDurationSeconds": 180,
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

**📝 Notas sobre Audio Filters**:
- **Criação automática**: Ao criar uma instância, um registro de filtros de áudio é criado automaticamente
- **Valores padrão**: Se não especificado, usa variáveis de ambiente ou defaults (3-300 segundos)
- **Hierarquia de configuração**: Body → Variáveis de Ambiente → Defaults
- **Variáveis de ambiente disponíveis**:
  - `AUDIO_FILTER_ENABLED` (default: true)
  - `AUDIO_MIN_DURATION` (default: 3)
  - `AUDIO_MAX_DURATION` (default: 300)

**📤 Exemplo Simplificado (usa defaults)**:
```bash
curl -X POST "https://localhost:8080/instance/create" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "instanceName": "bot-simples",
    "integration": "WHATSAPP-BAILEYS"
  }'
# Filtros de áudio serão criados automaticamente com valores padrão: 3-300 segundos
```

**✅ Resposta de Sucesso**:
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

**❌ Resposta de Erro**:
```json
{
  "status": "ERROR",
  "error": true,
  "response": {
    "message": "Instance name already exists"
  }
}
```

---

#### `GET /instance/fetchInstances`

> **Finalidade**: Lista todas as instâncias criadas no servidor.

**⚡ Quando usar**:
- Verificar quais instâncias estão disponíveis
- Monitorar status de conexão das instâncias
- Listar instâncias para seleção em interface

**📤 Exemplo de Chamada**:
```bash
curl "https://localhost:8080/instance/fetchInstances" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta**:
```json
{
  "status": "SUCCESS",
  "response": [
    {
      "instanceName": "bot-atendimento",
      "status": "open",
      "profileName": "Meu Bot",
      "profilePicUrl": "https://...",
      "qrcode": null
    },
    {
      "instanceName": "suporte-tecnico",
      "status": "connecting",
      "profileName": null,
      "profilePicUrl": null,
      "qrcode": "data:image/png;base64,..."
    },
    {
      "instanceName": "vendas-bot",
      "status": "close",
      "profileName": null,
      "profilePicUrl": null,
      "qrcode": null
    }
  ]
}
```

---

#### `GET /instance/{instanceName}/connect`

> **Finalidade**: Conecta uma instância desconectada e gera novo QR Code.

**⚡ Quando usar**:
- Instância foi desconectada
- Primeiro login após criação da instância
- Reconectar após logout

**📤 Exemplo de Chamada**:
```bash
curl "https://localhost:8080/instance/bot-atendimento/connect" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta com QR Code**:
```json
{
  "status": "SUCCESS",
  "response": {
    "qrcode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...",
    "message": "QR Code generated. Scan with WhatsApp to connect."
  }
}
```

**📥 Resposta se já conectado**:
```json
{
  "status": "SUCCESS",
  "response": {
    "message": "Instance is already connected",
    "connectionState": "open"
  }
}
```

---

#### `POST /instance/{instanceName}/restart`

> **Finalidade**: Reinicia uma instância específica.

**⚡ Quando usar**:
- Instância travou ou não responde
- Aplicar mudanças de configuração
- Resolver problemas de conexão

**📤 Exemplo de Chamada**:
```bash
curl -X POST "https://localhost:8080/instance/bot-atendimento/restart" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "message": "Instance restarted successfully",
    "instanceName": "bot-atendimento",
    "previousState": "open",
    "newState": "connecting"
  }
}
```

---

#### `GET /instance/{instanceName}/connectionState`

> **Finalidade**: Verifica o estado atual da conexão de uma instância.

**⚡ Quando usar**:
- Monitoramento de saúde da instância
- Verificar se pode enviar mensagens
- Status em dashboards

**📤 Exemplo de Chamada**:
```bash
curl "https://localhost:8080/instance/bot-atendimento/connectionState" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta (Conectado)**:
```json
{
  "status": "SUCCESS",
  "response": {
    "state": "open",
    "isConnected": true,
    "profileName": "Meu Bot de Atendimento",
    "profilePicUrl": "https://pps.whatsapp.net/...",
    "phoneNumber": "5511999999999",
    "connectedAt": "2025-10-01T10:30:00.000Z"
  }
}
```

**📥 Resposta (Desconectado)**:
```json
{
  "status": "SUCCESS",
  "response": {
    "state": "close",
    "isConnected": false,
    "profileName": null,
    "profilePicUrl": null,
    "phoneNumber": null,
    "lastSeen": "2025-10-01T08:15:00.000Z"
  }
}
```

---

#### `DELETE /instance/{instanceName}/logout`

> **Finalidade**: Faz logout da instância, mantendo configurações.

**⚡ Quando usar**:
- Trocar número WhatsApp da instância
- Desconectar temporariamente
- Manutenção sem perder configurações

**📤 Exemplo de Chamada**:
```bash
curl -X DELETE "https://localhost:8080/instance/bot-atendimento/logout" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "message": "Instance logged out successfully",
    "instanceName": "bot-atendimento",
    "configPreserved": true
  }
}
```

---

#### `DELETE /instance/{instanceName}/delete`

> **Finalidade**: Remove completamente uma instância e todas suas configurações.

**⚠️ Quando usar**:
- Instância não será mais usada
- Limpeza de instâncias de teste
- **CUIDADO**: Ação irreversível

**📤 Exemplo de Chamada**:
```bash
curl -X DELETE "https://localhost:8080/instance/bot-teste/delete" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "message": "Instance deleted successfully",
    "instanceName": "bot-teste",
    "deletedAt": "2025-10-01T11:45:00.000Z"
  }
}
```

---

#### `POST /instance/{instanceName}/setPresence`

> **Finalidade**: Define o status de presença da instância no WhatsApp.

**⚡ Quando usar**:
- Mostrar que bot está online
- Simular comportamento humano
- Indicar disponibilidade

**📋 Body Parâmetros**:
- `presence`: `"available"` | `"unavailable"` | `"composing"` | `"recording"`

**📤 Exemplo de Chamada**:
```bash
curl -X POST "https://localhost:8080/instance/bot-atendimento/setPresence" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "presence": "available"
  }'
```

**📥 Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "message": "Presence updated successfully",
    "instanceName": "bot-atendimento",
    "presence": "available",
    "updatedAt": "2025-10-01T11:50:00.000Z"
  }
}
```

---

### Funcionalidades Avançadas (Customizadas)

#### `GET /instance/filters/{instanceName}`

> **Finalidade**: Consulta todos os filtros de mensagem configurados para uma instância.

**⚡ Quando usar**:
- Verificar configuração atual de filtros
- Debug de mensagens não chegando
- Auditoria de configurações

**📤 Exemplo de Chamada**:
```bash
curl "https://localhost:8080/instance/filters/bot-atendimento" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta Completa**:
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

#### `PUT /instance/filters/{instanceName}`

> **Finalidade**: Atualiza os filtros de uma instância existente.

**⚡ Quando usar**:
- Ajustar filtros sem recriar instância
- Mudanças de regras de negócio
- Otimização baseada em uso

**📤 Exemplo de Chamada**:
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

**📥 Resposta**:
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

#### `GET /instance/filters/audio/{instanceName}`

> **Finalidade**: Consulta configurações específicas dos filtros de áudio (sempre existentes após criação da instância).

**⚡ Quando usar**:
- Verificar limites de duração de áudio
- Debug de áudios não processados
- Auditoria de configuração de mídia

**📤 Exemplo de Chamada**:
```bash
curl "https://localhost:8080/instance/filters/audio/bot-atendimento" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta**:
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

#### `PUT /instance/filters/audio/{instanceName}`

> **Finalidade**: Atualiza as configurações de filtros de áudio existentes.

**⚡ Quando usar**:
- Ajustar limites de duração de áudio após criação
- Modificar mensagens de feedback
- Configurar comportamento de resposta
- Alterar configurações sem recriar a instância

**📋 Body Parâmetros**:
- `minDurationSeconds`: Duração mínima (1-7200)
- `maxDurationSeconds`: Duração máxima (1-7200)
- `enabled`: Habilitar/desabilitar filtros
- `replyToOversizeAudio`: Enviar resposta para áudios fora dos limites
- `oversizeReaction`: Reaction personalizada para áudios inválidos

**📤 Exemplo de Chamada**:
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

**📥 Resposta**:
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
      "replyToOversizeAudio": true,
      "oversizeReaction": "⸘"
    },
    "appliedAt": "2025-10-01T12:15:00.000Z"
  }
}
```

---

#### `GET /instance/filters/audio/stats/{instanceName}`

> **Finalidade**: Estatísticas detalhadas dos filtros de áudio aplicados.

**⚡ Quando usar**:
- Monitorar efetividade dos filtros
- Identificar padrões de uso
- Otimizar configurações

**📤 Exemplo de Chamada**:
```bash
curl "https://localhost:8080/instance/filters/audio/stats/bot-atendimento" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta**:
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

#### `POST /instance/filters/audio/stats/reset/{instanceName}`

> **Finalidade**: Zera as estatísticas de filtros de áudio.

**⚡ Quando usar**:
- Início de novo período de análise
- Após mudanças de configuração
- Limpeza de dados antigos

**📤 Exemplo de Chamada**:
```bash
curl -X POST "https://localhost:8080/instance/filters/audio/stats/reset/bot-atendimento" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta**:
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

#### `POST /instance/duplicate`

> **Finalidade**: Duplica uma instância existente com todas as configurações.

**⚡ Quando usar**:
- Criar instâncias similares rapidamente
- Replicar configurações testadas
- Backup de configurações

**📋 Body Parâmetros**:
- `sourceInstanceName`: Nome da instância a ser copiada
- `newInstanceName`: Nome da nova instância

**📤 Exemplo de Chamada**:
```bash
curl -X POST "https://localhost:8080/instance/duplicate" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "sourceInstanceName": "bot-atendimento",
    "newInstanceName": "bot-vendas"
  }'
```

**📥 Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "message": "Instance duplicated successfully",
    "sourceInstance": "bot-atendimento",
    "newInstance": "bot-vendas",
    "copiedConfigurations": {
      "webhook": true,
      "filters": true,
      "audioProcessing": true,
      "textFilters": true
    },
    "qrcode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...",
    "createdAt": "2025-10-01T12:45:00.000Z"
  }
}
```

---

#### `GET /instance/{instanceName}/metrics`

> **Finalidade**: Métricas detalhadas de performance e uso da instância.

**⚡ Quando usar**:
- Monitoramento de performance
- Identificar problemas de recursos
- Relatórios de uso

**📤 Exemplo de Chamada**:
```bash
curl "https://localhost:8080/instance/bot-atendimento/metrics" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta Completa**:
```json
{
  "status": "SUCCESS",
  "response": {
    "instanceName": "bot-atendimento",
    "collectedAt": "2025-10-01T13:00:00.000Z",
    "connection": {
      "state": "open",
      "isConnected": true,
      "connectedSince": "2025-10-01T10:30:00.000Z",
      "uptime": 9000,
      "reconnections": 0
    },
    "performance": {
      "memoryUsage": {
        "rss": 134217728,
        "rssMB": 128,
        "heapUsed": 67108864,
        "heapUsedMB": 64,
        "heapTotal": 100663296,
        "heapTotalMB": 96
      },
      "cpu": {
        "usage": 12.5,
        "loadAverage": [0.8, 0.9, 1.1]
      },
      "uptime": 9000,
      "uptimeFormatted": "2h 30m"
    },
    "database": {
      "counts": {
        "messages": 1247,
        "contacts": 89,
        "chats": 23
      },
      "lastMessage": "2025-10-01T12:58:30.000Z"
    },
    "messaging": {
      "messagesReceived": 1247,
      "messagesSent": 342,
      "webhookDeliveries": 1589,
      "webhookFailures": 3,
      "deliveryRate": 99.81
    },
    "filters": {
      "messagesFiltered": 156,
      "filterRate": 11.11,
      "audioFiltered": 33,
      "textFiltered": 123
    }
  }
}
```

---

## 📊 Sistema de Fila Global

### `GET /queue/stats`

> **Finalidade**: Estatísticas em tempo real da fila global de processamento.

**⚡ Quando usar**:
- Monitorar performance do sistema
- Verificar rate limiting
- Dashboard de administração

**📤 Exemplo de Chamada**:
```bash
curl "https://localhost:8080/queue/stats" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta**:
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

### `GET /queue/metrics`

> **Finalidade**: Métricas avançadas e históricas da fila global.

**📤 Exemplo de Chamada**:
```bash
curl "https://localhost:8080/queue/metrics" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "period": {
      "start": "2025-10-01T00:00:00.000Z",
      "end": "2025-10-01T23:59:59.999Z"
    },
    "performance": {
      "totalProcessed": 98765,
      "averageLatency": 234,
      "peakThroughput": 45,
      "peakThroughputTime": "2025-10-01T14:30:00.000Z"
    },
    "errors": {
      "totalErrors": 89,
      "errorRate": 0.09,
      "errorsByType": {
        "timeout": 45,
        "connection": 23,
        "parsing": 12,
        "unknown": 9
      }
    },
    "byInstance": {
      "bot-atendimento": {
        "processed": 1247,
        "errors": 3,
        "averageLatency": 198
      },
      "bot-vendas": {
        "processed": 892,
        "errors": 1,
        "averageLatency": 156
      }
    }
  }
}
```

---

### `POST /queue/metrics/reset`

> **Finalidade**: Reseta todas as métricas da fila global.

**📤 Exemplo de Chamada**:
```bash
curl -X POST "https://localhost:8080/queue/metrics/reset" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "message": "Global queue metrics reset successfully",
    "resetAt": "2025-10-01T13:30:00.000Z",
    "previousMetrics": {
      "totalProcessed": 98765,
      "totalErrors": 89
    }
  }
}
```

---

## 🔄 Sistema Dual Webhook

### Monitoramento de Saúde

#### `GET /webhook/health`

> **Finalidade**: Verifica a saúde geral do sistema de webhooks.

**⚡ Quando usar**:
- Health check automático
- Monitoramento de infraestrutura
- Alertas de sistema

**📤 Exemplo de Chamada**:
```bash
curl "https://localhost:8080/webhook/health" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta (Sistema Saudável)**:
```json
{
  "status": "SUCCESS",
  "data": {
    "healthy": true,
    "timestamp": "2025-10-01T13:45:00.000Z",
    "summary": {
      "successRate": 98.5,
      "totalWebhooks": 15847,
      "pendingRetries": 2,
      "avgResponseTime": 245,
      "lastSuccessfulDelivery": "2025-10-01T13:44:30.000Z"
    },
    "config": {
      "globalWebhookEnabled": true,
      "monitoringWebhookEnabled": true,
      "retryEnabled": true,
      "maxRetries": 5
    },
    "thresholds": {
      "minSuccessRate": 95.0,
      "maxPendingRetries": 100,
      "maxResponseTime": 5000
    }
  }
}
```

**📥 Resposta (Sistema com Problemas)**:
```json
{
  "status": "SUCCESS",
  "data": {
    "healthy": false,
    "timestamp": "2025-10-01T13:45:00.000Z",
    "issues": [
      "Success rate below threshold: 92.3% < 95%",
      "Pending retries above limit: 156 > 100"
    ],
    "summary": {
      "successRate": 92.3,
      "totalWebhooks": 15847,
      "pendingRetries": 156,
      "avgResponseTime": 2890
    }
  }
}
```

---

#### `GET /webhook/metrics`

> **Finalidade**: Estatísticas detalhadas de todos os webhooks.

**📤 Exemplo de Chamada**:
```bash
curl "https://localhost:8080/webhook/metrics" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta Completa**:
```json
{
  "status": "SUCCESS",
  "metrics": {
    "overview": {
      "total": 15847,
      "successful": 15603,
      "failed": 244,
      "retries": 89,
      "averageResponseTime": 245
    },
    "errorAnalysis": {
      "errorsByType": {
        "timeout": 123,
        "network_error": 67,
        "server_error": 34,
        "client_error": 12,
        "rate_limit_or_timeout": 8
      },
      "errorsByStatusCode": {
        "408": 89,
        "500": 45,
        "502": 23,
        "503": 12,
        "404": 8
      }
    },
    "performance": {
      "responseTimeDistribution": {
        "under100ms": 4567,
        "100to500ms": 8934,
        "500to1000ms": 1890,
        "1to5seconds": 389,
        "over5seconds": 67
      },
      "fastestResponse": 23,
      "slowestResponse": 12456,
      "medianResponseTime": 234
    },
    "instanceStats": {
      "bot-atendimento": {
        "total": 5678,
        "successful": 5634,
        "failed": 44,
        "avgResponseTime": 198,
        "successRate": 99.22
      },
      "bot-vendas": {
        "total": 3456,
        "successful": 3401,
        "failed": 55,
        "avgResponseTime": 289,
        "successRate": 98.41
      }
    },
    "retrySystem": {
      "pending": 12,
      "totalFailed": 244,
      "averageAttempts": 2.3,
      "maxAttemptsReached": 23,
      "successAfterRetry": 21
    },
    "summary": {
      "successRate": 98.46,
      "errorRate": 1.54,
      "retryRate": 0.56,
      "avgResponseTime": 245
    },
    "periodCovered": {
      "start": "2025-10-01T00:00:00.000Z",
      "end": "2025-10-01T13:45:00.000Z",
      "durationHours": 13.75
    }
  }
}
```

---

### Logs e Auditoria

#### `GET /webhook/logs`

> **Finalidade**: Consulta logs recentes de webhooks com filtros.

**📋 Parâmetros de Query**:
- `limit` (opcional): Número máximo de logs (padrão: 100, máximo: 1000)
- `type` (opcional): `errors` para apenas erros, `success` para apenas sucessos
- `instance` (opcional): Filtrar por instância específica
- `since` (opcional): Data/hora em ISO 8601 para logs posteriores

**📤 Exemplo de Chamada (Todos os logs)**:
```bash
curl "https://localhost:8080/webhook/logs?limit=50" \
  -H "apikey: BQYHJGJHJ"
```

**📤 Exemplo de Chamada (Apenas erros de uma instância)**:
```bash
curl "https://localhost:8080/webhook/logs?type=errors&instance=bot-atendimento&limit=20" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta**:
```json
{
  "status": "SUCCESS",
  "data": {
    "logs": [
      {
        "id": "log_12345",
        "timestamp": "2025-10-01T13:42:15.234Z",
        "type": "main",
        "event": "messages.upsert",
        "instance": "bot-atendimento",
        "webhookUrl": "https://meusite.com/webhook-whatsapp",
        "result": {
          "success": true,
          "statusCode": 200,
          "statusText": "OK",
          "responseTime": 198,
          "responseSize": 45
        },
        "payload": {
          "event": "messages.upsert",
          "instance": "bot-atendimento",
          "messageId": "msg_67890"
        },
        "metadata": {
          "attempt": 1,
          "queueSize": 5,
          "processingTime": 12
        }
      },
      {
        "id": "log_12346",
        "timestamp": "2025-10-01T13:41:45.123Z",
        "type": "monitoring",
        "event": "queue.stats",
        "instance": null,
        "webhookUrl": "https://monitor.meusite.com/stats",
        "result": {
          "success": false,
          "statusCode": 408,
          "statusText": "Request Timeout",
          "responseTime": 5000,
          "error": "Connection timeout after 5000ms"
        },
        "payload": {
          "event": "queue.stats",
          "queueSize": 42
        },
        "metadata": {
          "attempt": 3,
          "nextRetry": "2025-10-01T13:49:45.123Z",
          "willRetry": true
        }
      }
    ],
    "pagination": {
      "total": 1247,
      "returned": 50,
      "hasMore": true,
      "nextPage": "?limit=50&offset=50"
    },
    "filters": {
      "applied": {
        "limit": 50
      }
    }
  }
}
```

---

#### `GET /webhook/logs/export`

> **Finalidade**: Exporta todos os logs em formato JSON ou CSV.

**📋 Parâmetros de Query**:
- `format`: `json` (padrão) ou `csv`
- `since` (opcional): Data inicial para exportação

**📤 Exemplo de Chamada (JSON)**:
```bash
curl "https://localhost:8080/webhook/logs/export?format=json" \
  -H "apikey: BQYHJGJHJ" \
  -o webhook-logs.json
```

**📤 Exemplo de Chamada (CSV)**:
```bash
curl "https://localhost:8080/webhook/logs/export?format=csv&since=2025-10-01T00:00:00Z" \
  -H "apikey: BQYHJGJHJ" \
  -o webhook-logs.csv
```

**📥 Resposta (JSON)**:
```json
{
  "exportInfo": {
    "generatedAt": "2025-10-01T13:50:00.000Z",
    "totalRecords": 15847,
    "period": {
      "start": "2025-09-01T00:00:00.000Z",
      "end": "2025-10-01T13:50:00.000Z"
    },
    "format": "json"
  },
  "logs": [
    // Array completo de logs...
  ]
}
```

---

### Sistema de Falhas e Retry

#### `GET /webhook/failed`

> **Finalidade**: Lista webhooks que falharam e estão aguardando retry.

**📤 Exemplo de Chamada**:
```bash
curl "https://localhost:8080/webhook/failed" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta**:
```json
{
  "status": "SUCCESS",
  "data": {
    "failedWebhooks": [
      {
        "id": "retry_abc123",
        "originalTimestamp": "2025-10-01T13:40:00.000Z",
        "payload": {
          "event": "messages.upsert",
          "instance": "bot-atendimento",
          "data": {
            "key": { "remoteJid": "5511999999999@s.whatsapp.net", "id": "msg123" },
            "message": { "conversation": "Hello World" }
          }
        },
        "webhookUrl": "https://webhook-down.example.com/events",
        "attempts": 3,
        "maxAttempts": 5,
        "lastAttempt": "2025-10-01T13:48:00.000Z",
        "nextRetry": "2025-10-01T13:56:00.000Z",
        "retryIn": 360,
        "lastError": "Connection timeout",
        "lastStatusCode": 408,
        "backoffMultiplier": 2,
        "currentDelay": 480
      },
      {
        "id": "retry_def456",
        "originalTimestamp": "2025-10-01T13:35:00.000Z",
        "payload": {
          "event": "queue.error",
          "timestamp": "2025-10-01T13:35:00.000Z",
          "data": { "error": "Rate limit exceeded" }
        },
        "webhookUrl": "https://monitor.example.com/alerts",
        "attempts": 5,
        "maxAttempts": 5,
        "lastAttempt": "2025-10-01T13:50:00.000Z",
        "nextRetry": null,
        "retryIn": null,
        "lastError": "Internal Server Error",
        "lastStatusCode": 500,
        "willRetry": false,
        "reason": "Max attempts reached"
      }
    ],
    "summary": {
      "total": 12,
      "pending": 8,
      "maxAttemptsReached": 4,
      "nextRetryIn": 180
    }
  }
}
```

---

#### `DELETE /webhook/failed/{webhookId}`

> **Finalidade**: Remove um webhook específico da fila de retry.

**⚡ Quando usar**:
- Webhook URL foi corrigido e retry não é mais necessário
- Cancelar retry de webhook específico
- Limpeza manual de falhas

**📤 Exemplo de Chamada**:
```bash
curl -X DELETE "https://localhost:8080/webhook/failed/retry_abc123" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta**:
```json
{
  "status": "SUCCESS",
  "data": {
    "message": "Failed webhook retry_abc123 cleared successfully",
    "webhookId": "retry_abc123",
    "clearedAt": "2025-10-01T14:00:00.000Z",
    "originalPayload": {
      "event": "messages.upsert",
      "instance": "bot-atendimento"
    }
  }
}
```

---

#### `DELETE /webhook/failed`

> **Finalidade**: Limpa todos os webhooks falhados da fila de retry.

**⚡ Quando usar**:
- Manutenção geral do sistema
- Após correção de problemas de infraestrutura
- Limpeza em massa

**📤 Exemplo de Chamada**:
```bash
curl -X DELETE "https://localhost:8080/webhook/failed" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta**:
```json
{
  "status": "SUCCESS",
  "data": {
    "message": "All failed webhooks cleared successfully",
    "clearedCount": 12,
    "clearedAt": "2025-10-01T14:05:00.000Z",
    "breakdown": {
      "pending": 8,
      "maxAttemptsReached": 4
    }
  }
}
```

---

### Testes de Conectividade

#### `POST /webhook/test`

> **Finalidade**: Testa conectividade com um webhook específico.

**⚡ Quando usar**:
- Validar URL de webhook antes de configurar
- Diagnosticar problemas de conectividade
- Teste de integração

**📋 Body Parâmetros**:
- `url` (obrigatório): URL do webhook para testar
- `payload` (opcional): Payload customizado para teste

**📤 Exemplo de Chamada (Teste Simples)**:
```bash
curl -X POST "https://localhost:8080/webhook/test" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "url": "https://meusite.com/webhook-test"
  }'
```

**📤 Exemplo de Chamada (Teste com Payload Customizado)**:
```bash
curl -X POST "https://localhost:8080/webhook/test" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "url": "https://meusite.com/webhook-test",
    "payload": {
      "event": "test.webhook",
      "instance": "test-instance",
      "data": {
        "message": "Teste de conectividade personalizado",
        "timestamp": "2025-10-01T14:10:00.000Z"
      }
    }
  }'
```

**📥 Resposta (Sucesso)**:
```json
{
  "status": "SUCCESS",
  "data": {
    "success": true,
    "url": "https://meusite.com/webhook-test",
    "statusCode": 200,
    "statusText": "OK",
    "responseTime": 234,
    "responseHeaders": {
      "content-type": "application/json",
      "server": "nginx/1.18.0",
      "x-response-time": "23ms"
    },
    "responseBody": {
      "received": true,
      "message": "Webhook received successfully"
    },
    "testedAt": "2025-10-01T14:10:00.000Z"
  }
}
```

**📥 Resposta (Falha)**:
```json
{
  "status": "SUCCESS",
  "data": {
    "success": false,
    "url": "https://webhook-down.example.com/test",
    "statusCode": 500,
    "statusText": "Internal Server Error",
    "responseTime": 5000,
    "error": "Internal server error occurred",
    "errorType": "server_error",
    "retryable": true,
    "testedAt": "2025-10-01T14:10:00.000Z"
  }
}
```

---

#### `DELETE /webhook/logs`

> **Finalidade**: Limpa todos os logs e métricas de webhooks.

**⚡ Quando usar**:
- Limpeza de dados antigos
- Reset para novo período de análise
- Manutenção de performance

**📤 Exemplo de Chamada**:
```bash
curl -X DELETE "https://localhost:8080/webhook/logs" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta**:
```json
{
  "status": "SUCCESS",
  "data": {
    "message": "Webhook logs and metrics cleared successfully",
    "clearedAt": "2025-10-01T14:15:00.000Z",
    "statistics": {
      "logsCleared": 15847,
      "metricsReset": true,
      "retainedFailedWebhooks": 12
    }
  }
}
```

---

## 🌐 Configuração Global de Webhooks

### `GET /webhook/global/config`

> **Finalidade**: Consulta a configuração atual dos webhooks globais.

**⚡ Quando usar**:
- Verificar configurações ativas
- Auditoria de configuração
- Debug de problemas de webhook

**📤 Exemplo de Chamada**:
```bash
curl "https://localhost:8080/webhook/global/config" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta (Configurado)**:
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

**📥 Resposta (Não Configurado)**:
```json
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
```

---

### `POST /webhook/global/config` / `PUT /webhook/global/config`

> **Finalidade**: Cria ou atualiza a configuração global de webhooks.

**⚡ Quando usar**:
- Primeira configuração do sistema
- Mudança de URLs de webhook
- Atualização de headers de autenticação

**📋 Body Parâmetros**:
- `principal`: Configuração do webhook principal (dados de negócio)
- `monitoramento`: Configuração do webhook de monitoramento (erros/stats)
- `webhookByEvents`: Separar webhooks por tipo de evento
- `headers`: Headers HTTP customizados para todas as requisições

**📤 Exemplo de Chamada (Configuração Completa)**:
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

**📤 Exemplo de Chamada (Atualização Parcial)**:
```bash
curl -X PUT "https://localhost:8080/webhook/global/config" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "principal": {
      "url": "https://novo-site.com/webhook-principal"
    },
    "headers": {
      "Authorization": "Bearer nova-api-key-123"
    }
  }'
```

**📥 Resposta**:
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

### `DELETE /webhook/global/config`

> **Finalidade**: Desabilita todos os webhooks globais, mantendo configurações.

**⚡ Quando usar**:
- Manutenção temporária
- Problemas no webhook de destino
- Desabilitação rápida sem perder configurações

**📤 Exemplo de Chamada**:
```bash
curl -X DELETE "https://localhost:8080/webhook/global/config" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta**:
```json
{
  "success": true,
  "message": "Global webhook configuration disabled successfully",
  "data": {
    "principal": {
      "enabled": false,
      "url": "https://meusite.com/webhook-principal"
    },
    "monitoramento": {
      "enabled": false,
      "url": "https://monitor.meusite.com/webhook-stats"
    },
    "webhookByEvents": true,
    "headers": {
      "Authorization": "Bearer sua-api-key-aqui"
    },
    "disabledAt": "2025-10-01T14:25:00.000Z",
    "previousState": "active",
    "canReactivate": true
  }
}
```

---

### `POST /webhook/global/test`

> **Finalidade**: Testa conectividade de webhook antes de salvar configuração.

**⚡ Quando usar**:
- Validar URL antes de configurar
- Teste de autenticação
- Verificar se webhook está funcionando

**📋 Body Parâmetros**:
- `url` (obrigatório): URL para testar
- `type` (opcional): `principal` ou `monitoramento`
- `headers` (opcional): Headers para incluir no teste

**📤 Exemplo de Chamada**:
```bash
curl -X POST "https://localhost:8080/webhook/global/test" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "url": "https://httpbin.org/post",
    "type": "principal",
    "headers": {
      "Authorization": "Bearer test-token-123"
    }
  }'
```

**📥 Resposta (Sucesso)**:
```json
{
  "success": true,
  "data": {
    "url": "https://httpbin.org/post",
    "type": "principal",
    "success": true,
    "statusCode": 200,
    "statusText": "OK",
    "responseTime": 511,
    "responseTimeFormatted": "511ms",
    "headers": {
      "content-type": "application/json",
      "server": "gunicorn/19.9.0",
      "content-length": "528"
    },
    "responseBody": {
      "args": {},
      "headers": {
        "Authorization": "Bearer test-token-123",
        "Content-Type": "application/json"
      },
      "json": {
        "event": "webhook.test",
        "instance": "test",
        "data": {
          "message": "Webhook connectivity test",
          "timestamp": "2025-10-01T14:30:00.000Z"
        }
      },
      "url": "https://httpbin.org/post"
    },
    "testedAt": "2025-10-01T14:30:00.000Z",
    "recommendation": "✅ Webhook is working correctly"
  }
}
```

**📥 Resposta (Falha)**:
```json
{
  "success": false,
  "data": {
    "url": "https://webhook-invalido.example.com/test",
    "type": "principal",
    "success": false,
    "statusCode": null,
    "error": "ENOTFOUND webhook-invalido.example.com",
    "errorType": "network_error",
    "responseTime": 5000,
    "testedAt": "2025-10-01T14:30:00.000Z",
    "recommendation": "❌ Check URL and network connectivity"
  }
}
```

---

## ⏳ Sistema de Feedback de Processamento

### `POST /process/start`

> **Finalidade**: Inicia feedback visual com reactions alternadas durante processamento.

**⚡ Quando usar**:
- Processos longos (transcrição, análise de áudio)
- Feedback visual para usuário
- Indicar que sistema está processando

**📋 Body Parâmetros**:
- `instance` (obrigatório): Nome da instância
- `chatId` (obrigatório): ID do chat WhatsApp
- `messageId` (obrigatório): ID da mensagem
- `processType` (opcional): Tipo do processamento para logs

**📤 Exemplo de Chamada**:
```bash
curl -X POST "https://localhost:8080/process/start" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "instance": "bot-atendimento",
    "chatId": "5511999999999@s.whatsapp.net",
    "messageId": "msg-12345",
    "processType": "audio-transcription"
  }'
```

**📥 Resposta**:
```json
{
  "success": true,
  "data": {
    "sessionId": "bot-atendimento:5511999999999@s.whatsapp.net:msg-12345",
    "instance": "bot-atendimento",
    "chatId": "5511999999999@s.whatsapp.net",
    "messageId": "msg-12345",
    "processType": "audio-transcription",
    "startedAt": "2025-10-01T14:35:00.000Z",
    "timeoutAt": "2025-10-01T14:45:00.000Z",
    "config": {
      "loopInterval": 3000,
      "timeout": 600000,
      "reactions": ["⏳", "🔄"]
    },
    "status": "started"
  }
}
```

**🔄 Comportamento Automático**:
- **Loop de Reactions**: ⏳ → 🔄 → 🔄 → ⏳ → 🔄 → 🔄 (a cada 3 segundos)
- **Timeout**: 10 minutos → reaction ⏰ + limpeza automática
- **Memória**: Sessão armazenada em memória para controle

---

### `POST /process/finish`

> **Finalidade**: Finaliza o processamento com resultado e reaction final.

**⚡ Quando usar**:
- Ao concluir processamento
- Para parar loop de reactions
- Enviar resultado para usuário

**📋 Body Parâmetros**:
- `instance`, `chatId`, `messageId`: Identificação da sessão
- `status` (obrigatório): `success` | `error` | `aborted`
- `texto` (opcional): Mensagem de texto para enviar ao usuário
- `errorMessage` (opcional): Detalhes do erro para logs

**📤 Exemplo de Chamada (Sucesso)**:
```bash
curl -X POST "https://localhost:8080/process/finish" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "instance": "bot-atendimento",
    "chatId": "5511999999999@s.whatsapp.net",
    "messageId": "msg-12345",
    "status": "success",
    "texto": "🎯 Transcrição completa: \"Olá, preciso de ajuda com meu pedido\""
  }'
```

**📤 Exemplo de Chamada (Erro)**:
```bash
curl -X POST "https://localhost:8080/process/finish" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "instance": "bot-atendimento",
    "chatId": "5511999999999@s.whatsapp.net",
    "messageId": "msg-12345",
    "status": "error",
    "errorMessage": "Audio format not supported",
    "texto": "❌ Não foi possível processar o áudio. Tente enviar em outro formato."
  }'
```

**📥 Resposta**:
```json
{
  "success": true,
  "data": {
    "sessionId": "bot-atendimento:5511999999999@s.whatsapp.net:msg-12345",
    "status": "success",
    "finishedAt": "2025-10-01T14:37:30.000Z",
    "duration": 150000,
    "durationFormatted": "2m 30s",
    "finalReaction": "✅",
    "textSent": true,
    "textMessage": "🎯 Transcrição completa: \"Olá, preciso de ajuda com meu pedido\"",
    "sessionCleaned": true,
    "timeoutCanceled": true
  }
}
```

**🎯 Reações Finais por Status**:
- `success`: ✅ + envia texto + limpa sessão
- `error`: ❌ + envia texto + limpa sessão
- `aborted`: ⚠️ + envia texto + limpa sessão

---

### `GET /process/status`

> **Finalidade**: Monitora todas as sessões ativas de processamento.

**⚡ Quando usar**:
- Dashboard de administração
- Monitoramento de sistema
- Debug de sessões travadas

**📤 Exemplo de Chamada**:
```bash
curl "https://localhost:8080/process/status" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta**:
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-10-01T14:40:00.000Z",
    "activeSessionsCount": 3,
    "activeSessions": [
      {
        "sessionId": "bot-atendimento:5511999999999@s.whatsapp.net:msg-123",
        "instance": "bot-atendimento",
        "chatId": "5511999999999@s.whatsapp.net",
        "messageId": "msg-123",
        "processType": "audio-transcription",
        "startTime": "2025-10-01T14:38:00.000Z",
        "timeoutAt": "2025-10-01T14:48:00.000Z",
        "runningFor": 120000,
        "runningForFormatted": "2m",
        "currentReaction": 1,
        "currentReactionEmoji": "🔄",
        "nextReactionIn": 1200,
        "timeoutIn": 480000
      },
      {
        "sessionId": "bot-vendas:5511888888888@s.whatsapp.net:msg-456",
        "instance": "bot-vendas",
        "chatId": "5511888888888@s.whatsapp.net",
        "messageId": "msg-456",
        "processType": "document-analysis",
        "startTime": "2025-10-01T14:39:30.000Z",
        "timeoutAt": "2025-10-01T14:49:30.000Z",
        "runningFor": 30000,
        "runningForFormatted": "30s",
        "currentReaction": 0,
        "currentReactionEmoji": "⏳",
        "nextReactionIn": 500,
        "timeoutIn": 570000
      }
    ],
    "statistics": {
      "totalSessionsStarted": 47,
      "totalSessionsCompleted": 44,
      "totalSessionsTimedOut": 2,
      "averageProcessingTime": 135000,
      "averageProcessingTimeFormatted": "2m 15s",
      "longestRunningSession": 450000,
      "longestRunningSessionFormatted": "7m 30s"
    },
    "systemHealth": {
      "memoryUsage": "12MB",
      "activeSessions": 3,
      "maxConcurrentSessions": 100,
      "utilizationPercent": 3.0
    }
  }
}
```

---

### `DELETE /process/{sessionId}`

> **Finalidade**: Força limpeza de uma sessão específica (admin/debug).

**⚡ Quando usar**:
- Sessão travada que não responde
- Cleanup manual para debugging
- Cancelamento forçado de processamento

**📤 Exemplo de Chamada**:
```bash
curl -X DELETE "https://localhost:8080/process/bot-atendimento:5511999999999@s.whatsapp.net:msg-123" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta**:
```json
{
  "success": true,
  "data": {
    "message": "Processing session cleaned successfully",
    "sessionId": "bot-atendimento:5511999999999@s.whatsapp.net:msg-123",
    "cleanedAt": "2025-10-01T14:42:00.000Z",
    "sessionInfo": {
      "instance": "bot-atendimento",
      "processType": "audio-transcription",
      "startTime": "2025-10-01T14:38:00.000Z",
      "runningFor": 240000,
      "runningForFormatted": "4m"
    },
    "actions": {
      "loopStopped": true,
      "timeoutCanceled": true,
      "memoryCleared": true,
      "finalReactionSent": false
    }
  }
}
```

---

## 🗂️ Sistema de Cleanup S3

### `GET /cleanup/schedule`

> **Finalidade**: Consulta o agendamento atual do cleanup automático.

**⚡ Quando usar**:
- Verificar configuração de limpeza
- Auditoria de retenção de dados
- Planning de armazenamento

**📤 Exemplo de Chamada**:
```bash
curl "https://localhost:8080/cleanup/schedule" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "enabled": true,
    "retentionDays": 1,
    "dailyTime": "03:00",
    "timezone": "America/Sao_Paulo",
    "lastExecution": {
      "timestamp": "2025-10-01T03:00:00-03:00",
      "success": true,
      "filesDeleted": 127,
      "errors": 0,
      "duration": "45s"
    },
    "nextExecution": {
      "timestamp": "2025-10-02T03:00:00-03:00",
      "inHours": 14.5,
      "status": "scheduled"
    },
    "configuration": {
      "bucketName": "evolution",
      "pathPattern": "audio_*",
      "sizeThresholdMB": 0,
      "backupBeforeDelete": false
    },
    "statistics": {
      "totalExecutions": 7,
      "totalFilesDeleted": 892,
      "totalSpaceFreed": "2.3GB",
      "averageFilesPerRun": 127,
      "lastError": null
    }
  }
}
```

---

### `PUT /cleanup/schedule`

> **Finalidade**: Atualiza a configuração do cleanup automático.

**⚡ Quando usar**:
- Alterar horário de execução
- Modificar período de retenção
- Habilitar/desabilitar cleanup

**📋 Body Parâmetros**:
- `enabled`: Habilitar/desabilitar cleanup
- `retentionDays`: Dias para manter arquivos (1-365)
- `dailyTime`: Horário de execução (HH:MM)
- `timezone`: Fuso horário

**📤 Exemplo de Chamada**:
```bash
curl -X PUT "https://localhost:8080/cleanup/schedule" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "enabled": true,
    "retentionDays": 2,
    "dailyTime": "02:30",
    "timezone": "America/Sao_Paulo"
  }'
```

**📥 Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "message": "Cleanup schedule updated successfully",
    "configuration": {
      "enabled": true,
      "retentionDays": 2,
      "dailyTime": "02:30",
      "timezone": "America/Sao_Paulo"
    },
    "changes": {
      "retentionDays": {
        "previous": 1,
        "current": 2,
        "changed": true
      },
      "dailyTime": {
        "previous": "03:00",
        "current": "02:30",
        "changed": true
      }
    },
    "nextExecution": {
      "timestamp": "2025-10-02T02:30:00-03:00",
      "rescheduled": true
    },
    "updatedAt": "2025-10-01T14:50:00.000Z"
  }
}
```

---

### `POST /cleanup/execute`

> **Finalidade**: Executa cleanup manual imediato.

**⚡ Quando usar**:
- Limpeza urgente de espaço
- Teste de configuração
- Manutenção ad-hoc

**📤 Exemplo de Chamada**:
```bash
curl -X POST "https://localhost:8080/cleanup/execute" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta (Em Execução)**:
```json
{
  "status": "SUCCESS",
  "response": {
    "message": "Manual cleanup started successfully",
    "executionId": "cleanup_manual_20251001_145500",
    "startedAt": "2025-10-01T14:55:00.000Z",
    "estimatedDuration": "30-60 seconds",
    "configuration": {
      "retentionDays": 2,
      "bucketName": "evolution",
      "pathPattern": "audio_*"
    },
    "status": "running"
  }
}
```

**📥 Resposta (Concluído)**:
```json
{
  "status": "SUCCESS",
  "response": {
    "message": "Manual cleanup completed successfully",
    "executionId": "cleanup_manual_20251001_145500",
    "startedAt": "2025-10-01T14:55:00.000Z",
    "completedAt": "2025-10-01T14:55:45.000Z",
    "duration": "45s",
    "results": {
      "filesScanned": 234,
      "filesDeleted": 89,
      "filesKept": 145,
      "errors": 0,
      "spaceFreed": "156MB"
    },
    "breakdown": {
      "olderThan2Days": 89,
      "recentFiles": 145
    },
    "nextScheduledRun": "2025-10-02T02:30:00-03:00"
  }
}
```

---

### `GET /cleanup/status`

> **Finalidade**: Status detalhado e próxima execução do cleanup.

**⚡ Quando usar**:
- Monitoramento de sistema
- Verificar última execução
- Dashboard de administração

**📤 Exemplo de Chamada**:
```bash
curl "https://localhost:8080/cleanup/status" \
  -H "apikey: BQYHJGJHJ"
```

**📥 Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "timestamp": "2025-10-01T15:00:00.000Z",
    "systemStatus": "healthy",
    "cleanup": {
      "enabled": true,
      "status": "idle",
      "retentionDays": 2,
      "nextExecution": {
        "timestamp": "2025-10-02T02:30:00-03:00",
        "inHours": 11.5,
        "inMinutes": 690,
        "status": "scheduled"
      }
    },
    "lastExecution": {
      "type": "manual",
      "executionId": "cleanup_manual_20251001_145500",
      "timestamp": "2025-10-01T14:55:00.000Z",
      "duration": "45s",
      "success": true,
      "results": {
        "filesDeleted": 89,
        "spaceFreed": "156MB",
        "errors": 0
      }
    },
    "storage": {
      "bucketName": "evolution",
      "currentFiles": 145,
      "estimatedTotalSize": "456MB",
      "oldestFile": "2025-09-30T10:15:00.000Z",
      "newestFile": "2025-10-01T14:48:00.000Z"
    },
    "statistics": {
      "thisMonth": {
        "totalRuns": 7,
        "filesDeleted": 892,
        "spaceFreed": "2.3GB",
        "averageRunDuration": "42s"
      },
      "allTime": {
        "totalRuns": 45,
        "filesDeleted": 5678,
        "spaceFreed": "12.8GB",
        "uptimePercent": 99.8
      }
    },
    "health": {
      "schedulerActive": true,
      "s3Connection": "healthy",
      "lastHealthCheck": "2025-10-01T14:59:30.000Z"
    }
  }
}
```

---

## 🔐 Autenticação

> Todos os endpoints requerem autenticação via header `apikey`:

```http
apikey: sua-chave-api
```

### 🔧 Configuração da API Key

A chave API é definida na variável de ambiente:
```env
AUTHENTICATION_API_KEY_KEY=sua-chave-aqui
```

### 🎵 Configuração de Filtros de Áudio

Variáveis de ambiente para configuração padrão de filtros de áudio:
```env
# Habilita/desabilita filtros de áudio globalmente
AUDIO_FILTER_ENABLED=true

# Duração mínima de áudio em segundos (default: 3)
AUDIO_MIN_DURATION=3

# Duração máxima de áudio em segundos (default: 300)
AUDIO_MAX_DURATION=300
```

**Hierarquia de configuração**:
1. **Body do request** (maior prioridade)
2. **Variáveis de ambiente** (prioridade média)
3. **Valores padrão do sistema** (menor prioridade)

### ⚠️ Códigos de Erro de Autenticação

**401 Unauthorized**:
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

**403 Forbidden**:
```json
{
  "status": "ERROR",
  "error": true,
  "response": {
    "message": "Invalid API key",
    "code": "INVALID_API_KEY"
  }
}
```

---

## 📖 Exemplos Práticos

### 🎯 Cenário 1: Configuração de Bot de Atendimento

```bash
# 1. Criar instância com filtros específicos
curl -X POST "https://localhost:8080/instance/create" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "instanceName": "atendimento-suporte",
    "integration": "WHATSAPP-BAILEYS",
    "webhook": {
      "enabled": true,
      "url": "https://meucrm.com/webhook/whatsapp",
      "events": ["MESSAGES_UPSERT"],
      "messageTypes": ["conversation", "audioMessage", "documentMessage"],
      "textFilters": {
        "allowedWords": ["suporte", "help", "ajuda", "problema", "dúvida"],
        "blockedWords": ["spam", "promoção", "desconto"],
        "allowedPatterns": ["^[!/]", "^#ticket", "^suporte"]
      },
      "audioProcessing": {
        "minDurationSeconds": 3,
        "maxDurationSeconds": 120,
        "replyToOversizeAudio": true
      }
    }
  }'

# 2. Configurar webhook global para monitoramento
curl -X POST "https://localhost:8080/webhook/global/config" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "principal": {
      "enabled": true,
      "url": "https://meucrm.com/webhook/whatsapp"
    },
    "monitoramento": {
      "enabled": true,
      "url": "https://monitor.meucrm.com/alerts"
    }
  }'

# 3. Verificar se instância conectou
curl "https://localhost:8080/instance/atendimento-suporte/connectionState" \
  -H "apikey: BQYHJGJHJ"
```

---

### 🎯 Cenário 2: Processamento de Áudio com Feedback

```bash
# 1. Iniciar feedback de processamento
curl -X POST "https://localhost:8080/process/start" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "instance": "atendimento-suporte",
    "chatId": "5511999999999@s.whatsapp.net",
    "messageId": "msg-audio-123",
    "processType": "transcricao-audio"
  }'

# 2. [Seu sistema processa o áudio...]
# 3. Finalizar com resultado

curl -X POST "https://localhost:8080/process/finish" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "instance": "atendimento-suporte",
    "chatId": "5511999999999@s.whatsapp.net",
    "messageId": "msg-audio-123",
    "status": "success",
    "texto": "🎯 Transcrição: \"Preciso de ajuda com meu pedido número 12345\""
  }'
```

---

### 🎯 Cenário 3: Monitoramento e Troubleshooting

```bash
# 1. Verificar saúde geral do sistema
curl "https://localhost:8080/webhook/health" \
  -H "apikey: BQYHJGJHJ"

# 2. Verificar estatísticas da fila
curl "https://localhost:8080/queue/stats" \
  -H "apikey: BQYHJGJHJ"

# 3. Ver logs de erro dos últimos webhooks
curl "https://localhost:8080/webhook/logs?type=errors&limit=10" \
  -H "apikey: BQYHJGJHJ"

# 4. Verificar métricas de uma instância específica
curl "https://localhost:8080/instance/atendimento-suporte/metrics" \
  -H "apikey: BQYHJGJHJ"

# 5. Verificar sessões de processamento ativas
curl "https://localhost:8080/process/status" \
  -H "apikey: BQYHJGJHJ"
```

---

### 🎯 Cenário 4: Ajuste de Filtros em Produção

```bash
# 1. Ver filtros atuais
curl "https://localhost:8080/instance/atendimento-suporte/filters" \
  -H "apikey: BQYHJGJHJ"

# 2. Ver estatísticas de filtros de áudio
curl "https://localhost:8080/instance/atendimento-suporte/filters/audio/stats" \
  -H "apikey: BQYHJGJHJ"

# 3. Ajustar filtros baseado nos dados
curl -X PUT "https://localhost:8080/instance/atendimento-suporte/filters/audio" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "minDurationSeconds": 5,
    "maxDurationSeconds": 180,
    "replyToOversizeAudio": true,
    "oversizeReaction": "⸘"
  }'

# 4. Resetar estatísticas para novo período
curl -X POST "https://localhost:8080/instance/atendimento-suporte/filters/audio/stats/reset" \
  -H "apikey: BQYHJGJHJ"
```

---

## 📄 Estruturas de Payload dos Webhooks

### 📡 Webhook Principal (Dados de Negócio)
```json
{
  "event": "messages.upsert",
  "instance": "atendimento-suporte",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "msg-123456"
    },
    "message": {
      "conversation": "Preciso de ajuda"
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

### 📊 Webhook Monitoramento (Erros e Estatísticas)
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

## 🔗 Códigos de Status HTTP

| Código | Status | Descrição |
|--------|--------|-----------|
| **200** | OK | Operação realizada com sucesso |
| **201** | Created | Recurso criado com sucesso |
| **400** | Bad Request | Dados inválidos na requisição |
| **401** | Unauthorized | API key ausente ou inválida |
| **403** | Forbidden | Sem permissão para acessar o recurso |
| **404** | Not Found | Recurso não encontrado |
| **500** | Internal Server Error | Erro interno do servidor |

---

## ✅ Checklist de Implementação

### ✅ Funcionalidades Implementadas

**🏢 Instâncias**:
- ✅ Criação com filtros avançados
- ✅ Listagem e status
- ✅ Conexão e reconexão
- ✅ Filtros de mensagem e áudio
- ✅ Duplicação de instâncias
- ✅ Métricas detalhadas

**📊 Sistema de Fila**:
- ✅ Rate limiting com token bucket
- ✅ Estatísticas em tempo real
- ✅ Processamento assíncrono

**🔄 Sistema Dual Webhook**:
- ✅ Webhook principal para dados
- ✅ Webhook monitoramento para alertas
- ✅ Sistema robusto de retry
- ✅ Logs e métricas detalhadas

**⏳ Feedback de Processamento**:
- ✅ Reactions visuais alternadas
- ✅ Timeout automático
- ✅ Envio de resultado via texto

**🗂️ Cleanup S3**:
- ✅ Agendamento automático
- ✅ Execução manual
- ✅ Configuração flexível

---

> **📋 Versão da Documentação**: 2.2.1
> **🗓️ Última Atualização**: 2025-10-01
> **🌐 Ambiente**: Evolution API Lite