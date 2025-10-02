# Setup & Configuration - Sistema de Fila Global

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- PostgreSQL 12+
- RabbitMQ 3.8+
- MinIO/S3 (para storage de mídia)

### 1. Clonagem e Dependências

```bash
git clone https://github.com/EvolutionAPI/evolution-api-lite.git
cd evolution-api-lite
npm install
```

### 2. Configuração do Banco de Dados

#### PostgreSQL Setup

```sql
-- Criar database
CREATE DATABASE evolution_api_lite;

-- Conectar ao database
\c evolution_api_lite;

-- Executar migrations (via Prisma)
npx prisma migrate deploy
```

#### Schema Adicional - Audio Filters

A tabela `instance_audio_filters` é criada automaticamente pelas migrations:

```sql
CREATE TABLE instance_audio_filters (
  id SERIAL PRIMARY KEY,
  instance_name VARCHAR(255) UNIQUE NOT NULL,
  min_duration_seconds INTEGER DEFAULT 3,
  max_duration_seconds INTEGER DEFAULT 300,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_instance_audio_filters_name ON instance_audio_filters(instance_name);
```

### 3. RabbitMQ Configuration

#### Instalação RabbitMQ

```bash
# Ubuntu/Debian
sudo apt-get install rabbitmq-server

# CentOS/RHEL
sudo yum install rabbitmq-server

# Iniciar serviço
sudo systemctl start rabbitmq-server
sudo systemctl enable rabbitmq-server
```

#### Configuração de Filas

O sistema cria automaticamente as filas necessárias:
- `global.messages` - Fila principal para todas as mensagens
- `{instance}.webhook` - Filas por instância (padrão Evolution API)

### 4. MinIO/S3 Setup

#### MinIO Local (Desenvolvimento)

```bash
# Download MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio

# Iniciar MinIO
MINIO_ROOT_USER=evolution MINIO_ROOT_PASSWORD=evolution123 ./minio server ./minio-data --console-address ":9001" --address ":9000"
```

#### S3 Produção

Configure credenciais AWS S3 nas variáveis de ambiente.

---

## ⚙️ Configuração de Variáveis de Ambiente

### Arquivo .env Principal

```env
# Server Configuration
SERVER_URL=http://localhost:8080
SERVER_PORT=8080

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/evolution_api_lite"

# RabbitMQ
RABBITMQ_URI="amqp://localhost:5672"

# Authentication
AUTHENTICATION_API_KEY_KEY="BQYHJGJHJ"
AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true

# Instance Management
INSTANCE_DEL_TEMP_INSTANCES=true
```

### Configuração do Sistema de Fila Global

```env
# === GLOBAL QUEUE SYSTEM ===

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
```

### Configuração S3/MinIO

```env
# === S3/MINIO CONFIGURATION ===

# MinIO Local (Desenvolvimento)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=evolution
MINIO_SECRET_KEY=evolution123
MINIO_BUCKET=evolution
MINIO_USE_SSL=false

# AWS S3 (Produção)
# MINIO_ENDPOINT=s3.amazonaws.com
# MINIO_ACCESS_KEY=YOUR_AWS_ACCESS_KEY
# MINIO_SECRET_KEY=YOUR_AWS_SECRET_KEY
# MINIO_BUCKET=your-s3-bucket
# MINIO_USE_SSL=true

# S3 Cleanup Automático
S3_CLEANUP_ENABLED=true
S3_CLEANUP_DAYS=1
S3_CLEANUP_SCHEDULE_TIME=03:00
S3_CLEANUP_TIMEZONE=America/Sao_Paulo
```

### Sistema Processing Feedback

```env
# === PROCESSING FEEDBACK SYSTEM ===

PROCESSING_FEEDBACK_ENABLED=true
PROCESSING_FEEDBACK_LOOP_INTERVAL=3000     # 3 segundos entre reactions
PROCESSING_FEEDBACK_TIMEOUT=600000         # 10 minutos timeout

# Reactions (emojis)
PROCESSING_FEEDBACK_REACTIONS_PROCESSING=🔄,⏳
PROCESSING_FEEDBACK_REACTIONS_FINAL_SUCCESS=✅
PROCESSING_FEEDBACK_REACTIONS_FINAL_ERROR=❌
PROCESSING_FEEDBACK_REACTIONS_FINAL_ABORTED=⚠️
PROCESSING_FEEDBACK_REACTIONS_FINAL_TIMEOUT=🤷
```

---

## 🔧 Configuração por Ambiente

### Desenvolvimento (.env.dev)

```env
NODE_ENV=development
LOG_LEVEL=debug

SERVER_URL=http://localhost:8080
GLOBAL_QUEUE_RATE_LIMIT=50  # Menor para desenvolvimento
TOKEN_BUCKET_CAPACITY=50

# MinIO local
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false

# Cleanup mais frequente para testes
S3_CLEANUP_DAYS=0.1  # 2.4 horas
```

### Produção (.env.prod)

```env
NODE_ENV=production
LOG_LEVEL=info

SERVER_URL=https://api.your-domain.com
GLOBAL_QUEUE_RATE_LIMIT=500
TOKEN_BUCKET_CAPACITY=500

# AWS S3
MINIO_ENDPOINT=s3.amazonaws.com
MINIO_USE_SSL=true

# Cleanup diário
S3_CLEANUP_DAYS=1
S3_CLEANUP_SCHEDULE_TIME=03:00
```

### S3-Only (.env.s3-only)

```env
# Configuração específica para processamento S3-only
ENABLE_LOCAL_MEDIA_DOWNLOAD=false
FORCE_S3_UPLOAD=true
AUDIO_FILTER_ENABLED=true

# Rate limiting agressivo
GLOBAL_QUEUE_RATE_LIMIT=1000
TOKEN_BUCKET_CAPACITY=1000

# Cleanup agressivo (4 horas)
S3_CLEANUP_DAYS=0.17
```

---

## 🏗️ Configuração de Banco - Prisma

### Schema Principal (prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Tabela para configurações de filtro por instância
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

// Configuração global de webhooks
model GlobalWebhookConfig {
  id                Int      @id @default(autoincrement())
  principalEnabled  Boolean  @default(false) @map("principal_enabled")
  principalUrl      String?  @map("principal_url")
  monitoringEnabled Boolean  @default(false) @map("monitoring_enabled")
  monitoringUrl     String?  @map("monitoring_url")
  webhookByEvents   Boolean  @default(false) @map("webhook_by_events")
  headers           Json?
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  @@map("global_webhook_config")
}

// Estatísticas de processamento
model ProcessingStats {
  id               Int      @id @default(autoincrement())
  instanceName     String   @map("instance_name")
  date            DateTime @default(now())
  messagesTotal   Int      @default(0) @map("messages_total")
  audioFiltered   Int      @default(0) @map("audio_filtered")
  rateLimited     Int      @default(0) @map("rate_limited")
  webhookErrors   Int      @default(0) @map("webhook_errors")

  @@unique([instanceName, date])
  @@map("processing_stats")
}
```

### Executar Migrations

```bash
# Gerar migration
npx prisma migrate dev --name add-global-queue-system

# Deploy em produção
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate
```

---

## 🚦 Inicialização do Sistema

### Verificação de Serviços

Crie um script de verificação `scripts/check-services.sh`:

```bash
#!/bin/bash

echo "🔍 Verificando serviços..."

# PostgreSQL
if pg_isready -h localhost -p 5432; then
  echo "✅ PostgreSQL: OK"
else
  echo "❌ PostgreSQL: ERRO"
fi

# RabbitMQ
if curl -s http://localhost:15672 > /dev/null; then
  echo "✅ RabbitMQ: OK"
else
  echo "❌ RabbitMQ: ERRO"
fi

# MinIO
if curl -s http://localhost:9000/minio/health/live > /dev/null; then
  echo "✅ MinIO: OK"
else
  echo "❌ MinIO: ERRO"
fi

echo "✅ Verificação concluída"
```

### Script de Inicialização

```bash
#!/bin/bash

echo "🚀 Iniciando Evolution API Lite..."

# 1. Verificar serviços
./scripts/check-services.sh

# 2. Executar migrations
npx prisma migrate deploy

# 3. Inicializar aplicação
npm run start:prod
```

---

## 📋 Configuração Inicial via API

### 1. Configurar Webhook Global

```bash
curl -X POST "http://localhost:8080/webhook/global/config" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "principal": {
      "enabled": true,
      "url": "https://your-webhook.com/principal"
    },
    "monitoramento": {
      "enabled": true,
      "url": "https://your-webhook.com/monitoring"
    },
    "headers": {
      "Authorization": "Bearer your-token"
    }
  }'
```

### 2. Configurar Filtros de Áudio

```bash
curl -X PUT "http://localhost:8080/instance/default/filters/audio" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "minDurationSeconds": 3,
    "maxDurationSeconds": 300,
    "enabled": true
  }'
```

### 3. Configurar Cleanup S3

```bash
curl -X PUT "http://localhost:8080/cleanup/schedule" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "enabled": true,
    "retentionDays": 1,
    "dailyTime": "03:00",
    "timezone": "America/Sao_Paulo"
  }'
```

---

## 🔒 Configuração de Segurança

### 1. API Keys

Configure API keys fortes:

```env
AUTHENTICATION_API_KEY_KEY="your-strong-api-key-here"
```

### 2. CORS

```env
CORS_ORIGIN=["https://your-dashboard.com", "https://your-app.com"]
CORS_METHODS=["GET", "POST", "PUT", "DELETE"]
```

### 3. Rate Limiting

```env
# Rate limiting por IP (requests/minuto)
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# Rate limiting global (mensagens/minuto)
GLOBAL_QUEUE_RATE_LIMIT=500
```

### 4. SSL/TLS

Para produção, configure SSL:

```env
SSL_ENABLED=true
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

---

## 📊 Configuração de Logs

### Configuração de Logging

```env
# Nível de log
LOG_LEVEL=info  # debug, info, warn, error

# Formato de log
LOG_FORMAT=json  # json, text

# Arquivos de log
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs/evolution-api.log
LOG_FILE_MAX_SIZE=10MB
LOG_FILE_MAX_FILES=5
```

### Estrutura de Logs

```bash
mkdir -p logs
touch logs/evolution-api.log
touch logs/global-queue.log
touch logs/webhook-errors.log
```

---

## ✅ Verificação da Instalação

### 1. Health Check

```bash
curl "http://localhost:8080/health" -H "apikey: BQYHJGJHJ"
```

### 2. Status da Fila

```bash
curl "http://localhost:8080/queue/stats" -H "apikey: BQYHJGJHJ"
```

### 3. Configuração de Webhooks

```bash
curl "http://localhost:8080/webhook/global/config" -H "apikey: BQYHJGJHJ"
```

### 4. Teste de Processing Feedback

```bash
curl -X POST "http://localhost:8080/process/start" \
  -H "Content-Type: application/json" \
  -d '{
    "instance": "test",
    "chatId": "5511999999999@s.whatsapp.net",
    "messageId": "test-123",
    "processType": "test"
  }'
```

---

## 🔧 Troubleshooting da Configuração

### Problemas Comuns

1. **Erro de conexão PostgreSQL**
   ```bash
   # Verificar conexão
   psql $DATABASE_URL
   ```

2. **RabbitMQ não responde**
   ```bash
   sudo systemctl status rabbitmq-server
   sudo systemctl restart rabbitmq-server
   ```

3. **MinIO inacessível**
   ```bash
   curl http://localhost:9000/minio/health/live
   ```

4. **Migrations não executam**
   ```bash
   npx prisma migrate reset
   npx prisma migrate deploy
   ```

### Logs de Debug

Para debug detalhado:

```env
LOG_LEVEL=debug
GLOBAL_QUEUE_DEBUG=true
WEBHOOK_DEBUG=true
S3_DEBUG=true
```

---

**Próximo**: [Architecture](./architecture.md) - Entenda a arquitetura do sistema