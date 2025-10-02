# Operations & Monitoring - Sistema de Fila Global

## 📊 Monitoramento e Métricas

### Dashboard de Métricas Principais

O sistema fornece métricas abrangentes através de diversos endpoints:

#### 1. Status da Fila Global

```bash
curl "http://localhost:8080/queue/stats" -H "apikey: BQYHJGJHJ"
```

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

#### 2. Status de Processing Feedback

```bash
curl "http://localhost:8080/process/status" -H "apikey: BQYHJGJHJ"
```

**Métricas retornadas:**
- Sessões ativas de processamento
- Tempo médio de processamento
- Sessões por instância
- Timeouts ocorridos

#### 3. Status do Cleanup S3

```bash
curl "http://localhost:8080/cleanup/status" -H "apikey: BQYHJGJHJ"
```

**Informações incluídas:**
- Próxima execução agendada
- Última execução realizada
- Arquivos deletados/erros
- Configuração atual

---

## 🔍 KPIs e Métricas de Performance

### Métricas de Throughput

| Métrica | Descrição | Endpoint | Objetivo |
|---------|-----------|----------|----------|
| **Messages/Minute** | Mensagens processadas por minuto | `/queue/stats` | >= 500/min |
| **Queue Size** | Tamanho atual da fila | `/queue/stats` | < 100 msgs |
| **Rate Limit Usage** | % de tokens consumidos | `/queue/stats` | < 80% |
| **Audio Filter Rate** | % de áudios filtrados | `/queue/stats` | Variável |

### Métricas de Latência

| Métrica | Descrição | Objetivo |
|---------|-----------|----------|
| **Queue Processing Time** | Tempo médio na fila | < 5 segundos |
| **S3 Upload Time** | Tempo de upload para S3 | < 10 segundos |
| **Webhook Response Time** | Tempo de resposta do webhook | < 30 segundos |
| **End-to-End Latency** | Tempo total de processamento | < 45 segundos |

### Métricas de Qualidade

| Métrica | Descrição | Objetivo |
|---------|-----------|----------|
| **Webhook Success Rate** | % de webhooks entregues com sucesso | >= 99% |
| **S3 Upload Success Rate** | % de uploads S3 bem-sucedidos | >= 99.9% |
| **Queue Message Loss** | Mensagens perdidas na fila | 0% |
| **Filter Accuracy** | Precisão dos filtros de áudio | >= 95% |

---

## 📈 Alertas e Thresholds

### 1. Alertas Críticos (Prioridade P1)

```typescript
interface CriticalAlerts {
  // Sistema parado
  systemDown: {
    condition: "HTTP 500 por > 5 minutos";
    action: "Notificação imediata + escalation";
  };

  // Fila muito grande
  queueOverflow: {
    condition: "Queue size > 1000 mensagens";
    action: "Notificação imediata + rate limiting emergency";
  };

  // S3 inacessível
  s3Unavailable: {
    condition: "S3 upload errors > 5 consecutivos";
    action: "Notificação imediata + fallback mode";
  };

  // Rate limit saturado
  rateLimitSaturation: {
    condition: "Tokens < 10% da capacidade por > 10 minutos";
    action: "Notificação + análise de carga";
  };
}
```

### 2. Alertas de Warning (Prioridade P2)

```typescript
interface WarningAlerts {
  // Performance degradada
  highLatency: {
    condition: "Latência média > 30 segundos";
    action: "Investigar performance";
  };

  // Taxa de erro aumentada
  errorRateHigh: {
    condition: "Error rate > 5% em 15 minutos";
    action: "Monitorar e investigar";
  };

  // Muitos filtros aplicados
  highFilterRate: {
    condition: "Audio filter rate > 50%";
    action: "Revisar configuração de filtros";
  };

  // Processing feedback timeout
  processingTimeouts: {
    condition: "> 10 timeouts em 1 hora";
    action: "Verificar sistemas externos";
  };
}
```

### 3. Configuração de Monitoramento

```env
# Thresholds de alertas
ALERT_QUEUE_SIZE_CRITICAL=1000
ALERT_QUEUE_SIZE_WARNING=500
ALERT_RATE_LIMIT_CRITICAL=10  # % restante
ALERT_RATE_LIMIT_WARNING=25   # % restante
ALERT_ERROR_RATE_CRITICAL=10  # %
ALERT_ERROR_RATE_WARNING=5    # %
ALERT_LATENCY_CRITICAL=60000  # ms
ALERT_LATENCY_WARNING=30000   # ms

# Webhooks de alerta
ALERT_WEBHOOK_CRITICAL=https://your-alerts.com/critical
ALERT_WEBHOOK_WARNING=https://your-alerts.com/warning
```

---

## 🔧 Operações de Manutenção

### 1. Limpeza Manual do Sistema

#### Limpeza de Fila

```bash
# Verificar tamanho da fila
curl "http://localhost:8080/queue/stats" -H "apikey: BQYHJGJHJ"

# Se necessário, drenar fila gradualmente
# (implementar endpoint de drainage controlada)
curl -X POST "http://localhost:8080/queue/drain" \
  -H "apikey: BQYHJGJHJ" \
  -d '{"rate": 100, "duration": 300}' # 100 msgs/min por 5 min
```

#### Limpeza S3 Manual

```bash
# Executar cleanup imediato
curl -X POST "http://localhost:8080/cleanup/execute" -H "apikey: BQYHJGJHJ"

# Limpeza com parâmetros customizados
curl -X POST "http://localhost:8080/cleanup/execute" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "retentionHours": 6,
    "dryRun": false,
    "prefix": "audio_"
  }'
```

#### Limpeza de Sessões Processing

```bash
# Listar sessões ativas
curl "http://localhost:8080/process/status" -H "apikey: BQYHJGJHJ"

# Forçar limpeza de sessão específica
curl -X DELETE "http://localhost:8080/process/instance1:5511999999999@s.whatsapp.net:msg123" \
  -H "apikey: BQYHJGJHJ"

# Limpeza geral de sessões órfãs
curl -X POST "http://localhost:8080/process/cleanup" \
  -H "apikey: BQYHJGJHJ" \
  -d '{"olderThan": 3600000}' # 1 hora
```

### 2. Ajuste de Configurações em Runtime

#### Rate Limiting Dinâmico

```bash
# Ajustar rate limit temporariamente
curl -X PUT "http://localhost:8080/config/rate-limit" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "capacity": 1000,
    "refillRate": 1000,
    "duration": 3600000
  }' # 1 hora de limite aumentado
```

#### Filtros Emergenciais

```bash
# Aplicar filtro emergencial global
curl -X POST "http://localhost:8080/filters/emergency" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "enabled": true,
    "minDurationSeconds": 10,
    "maxDurationSeconds": 60,
    "reason": "High load emergency filter"
  }'
```

### 3. Backup e Recovery

#### Backup de Configurações

```bash
# Backup completo de configurações
curl "http://localhost:8080/admin/export-config" -H "apikey: BQYHJGJHJ" > config-backup.json

# Backup específico
curl "http://localhost:8080/admin/export-config?type=audio-filters" -H "apikey: BQYHJGJHJ" > audio-filters-backup.json
curl "http://localhost:8080/admin/export-config?type=webhooks" -H "apikey: BQYHJGJHJ" > webhooks-backup.json
```

#### Restore de Configurações

```bash
# Restore completo
curl -X POST "http://localhost:8080/admin/import-config" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d @config-backup.json

# Restore específico
curl -X POST "http://localhost:8080/admin/import-config?type=audio-filters" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d @audio-filters-backup.json
```

---

## 📊 Logs e Observabilidade

### 1. Estrutura de Logs

#### Log Levels e Categorias

```typescript
interface LogStructure {
  // Logs de aplicação
  application: {
    level: "info" | "warn" | "error" | "debug";
    timestamp: string;
    component: string;
    message: string;
    metadata?: object;
  };

  // Logs de fila
  queue: {
    level: string;
    timestamp: string;
    operation: "enqueue" | "dequeue" | "error" | "stats";
    instanceName?: string;
    messageId?: string;
    duration?: number;
    error?: string;
  };

  // Logs de webhook
  webhook: {
    level: string;
    timestamp: string;
    type: "main" | "monitoring";
    url: string;
    statusCode: number;
    responseTime: number;
    error?: string;
  };

  // Logs de S3
  s3: {
    level: string;
    timestamp: string;
    operation: "upload" | "delete" | "cleanup";
    bucket: string;
    key?: string;
    size?: number;
    duration?: number;
    error?: string;
  };
}
```

#### Configuração de Logs

```env
# Configuração de logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_OUTPUT=console,file

# Arquivos de log separados
LOG_FILE_APPLICATION=./logs/application.log
LOG_FILE_QUEUE=./logs/queue.log
LOG_FILE_WEBHOOK=./logs/webhook.log
LOG_FILE_S3=./logs/s3.log

# Rotação de logs
LOG_MAX_SIZE=100MB
LOG_MAX_FILES=10
LOG_COMPRESS=true
```

### 2. Queries de Log Úteis

#### Análise de Performance

```bash
# Top 10 instâncias com mais mensagens
grep "queue.*enqueue" logs/queue.log | \
  jq -r '.instanceName' | \
  sort | uniq -c | sort -nr | head -10

# Latência média por hora
grep "webhook.*main" logs/webhook.log | \
  jq -r '[.timestamp, .responseTime] | @csv' | \
  awk -F, '{sum+=$2; count++} END {print "Average:", sum/count "ms"}'

# Erros mais frequentes
grep "\"level\":\"error\"" logs/*.log | \
  jq -r '.error' | \
  sort | uniq -c | sort -nr | head -5
```

#### Análise de Filtros

```bash
# Taxa de filtros por instância
grep "filter.*applied" logs/application.log | \
  jq -r '.instanceName' | \
  sort | uniq -c | sort -nr

# Distribuição de duração de áudios
grep "audio.*duration" logs/application.log | \
  jq -r '.metadata.duration' | \
  awk '{
    if ($1 < 10) short++;
    else if ($1 < 60) medium++;
    else long++;
  } END {
    print "Short (<10s):", short;
    print "Medium (10-60s):", medium;
    print "Long (>60s):", long;
  }'
```

### 3. Monitoramento de Health

#### Health Check Endpoint

```typescript
interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  components: {
    database: {
      status: "up" | "down";
      responseTime: number;
    };
    rabbitmq: {
      status: "up" | "down";
      queueSize: number;
      connectionCount: number;
    };
    s3: {
      status: "up" | "down";
      responseTime: number;
    };
    globalQueue: {
      status: "healthy" | "degraded" | "unhealthy";
      queueSize: number;
      rateLimitStatus: {
        tokens: number;
        capacity: number;
      };
    };
    processingFeedback: {
      status: "healthy" | "degraded";
      activeSessions: number;
      timeouts: number;
    };
  };
}
```

#### Script de Monitoramento

```bash
#!/bin/bash
# health-monitor.sh

API_KEY="BQYHJGJHJ"
BASE_URL="http://localhost:8080"

echo "🔍 Health Check - $(date)"
echo "================================"

# Health geral
health=$(curl -s "$BASE_URL/health" -H "apikey: $API_KEY")
status=$(echo $health | jq -r '.status')

echo "Status Geral: $status"

# Componentes específicos
queue_size=$(curl -s "$BASE_URL/queue/stats" -H "apikey: $API_KEY" | jq -r '.queueSize')
rate_limit=$(curl -s "$BASE_URL/queue/stats" -H "apikey: $API_KEY" | jq -r '.rateLimitStatus.tokens')
active_sessions=$(curl -s "$BASE_URL/process/status" -H "apikey: $API_KEY" | jq -r '.activeSessionsCount')

echo "Fila Global: $queue_size mensagens"
echo "Rate Limit: $rate_limit tokens disponíveis"
echo "Sessões Ativas: $active_sessions processamentos"

# Alertas
if [ "$queue_size" -gt 500 ]; then
  echo "⚠️  ALERTA: Fila muito grande ($queue_size)"
fi

if [ "$rate_limit" -lt 50 ]; then
  echo "⚠️  ALERTA: Rate limit baixo ($rate_limit)"
fi

if [ "$active_sessions" -gt 50 ]; then
  echo "⚠️  ALERTA: Muitas sessões ativas ($active_sessions)"
fi

echo "================================"
```

---

## 🚨 Incident Response

### 1. Runbooks de Emergência

#### Sistema Fora do Ar

```markdown
# RUNBOOK: Sistema Fora do Ar

## Sintomas
- HTTP 500/503 errors
- Timeout em todos os endpoints
- Health check falha

## Investigação Imediata
1. Verificar logs de aplicação: `tail -f logs/application.log`
2. Verificar recursos do sistema: `top`, `df -h`, `free -m`
3. Verificar serviços dependentes:
   - PostgreSQL: `systemctl status postgresql`
   - RabbitMQ: `systemctl status rabbitmq-server`
   - MinIO: `curl http://localhost:9000/minio/health/live`

## Ações de Recovery
1. Restart da aplicação: `systemctl restart evolution-api`
2. Se PostgreSQL down: `systemctl restart postgresql`
3. Se RabbitMQ down: `systemctl restart rabbitmq-server`
4. Se MinIO down: `./restart-minio.sh`

## Escalation
- Se recovery > 10 minutos: Notificar time de infraestrutura
- Se perda de dados: Notificar time de produto
```

#### Fila Saturada

```markdown
# RUNBOOK: Fila Saturada

## Sintomas
- Queue size > 1000 mensagens
- Rate limit constantemente esgotado
- Latência muito alta

## Investigação
1. Verificar tamanho da fila: `curl "http://localhost:8080/queue/stats"`
2. Verificar throughput: Analisar logs de webhook
3. Identificar instâncias problemáticas

## Ações Imediatas
1. Aumentar rate limit temporariamente:
   ```bash
   curl -X PUT "http://localhost:8080/config/rate-limit" \
     -d '{"capacity": 1000, "refillRate": 1000}'
   ```

2. Aplicar filtros emergenciais:
   ```bash
   curl -X POST "http://localhost:8080/filters/emergency" \
     -d '{"minDurationSeconds": 10, "maxDurationSeconds": 60}'
   ```

3. Drenar fila controladamente:
   ```bash
   curl -X POST "http://localhost:8080/queue/drain" \
     -d '{"rate": 200, "duration": 600}'
   ```

## Investigação Profunda
- Analisar distribuição de instâncias
- Verificar padrões de uso
- Revisar configurações de filtro
```

#### S3 Inacessível

```markdown
# RUNBOOK: S3 Inacessível

## Sintomas
- Uploads S3 falhando
- Errors "connection refused" para MinIO
- Mensagens sendo rejeitadas

## Investigação
1. Testar conectividade: `curl http://localhost:9000/minio/health/live`
2. Verificar logs S3: `tail -f logs/s3.log`
3. Verificar espaço em disco: `df -h /path/to/minio-data`

## Ações Imediatas
1. Restart MinIO: `./restart-minio.sh`
2. Se problema de espaço: Executar cleanup emergencial
3. Se MinIO inoperante: Ativar modo degradado

## Modo Degradado
1. Desabilitar upload S3 temporariamente
2. Ativar fallback para processamento sem áudio
3. Configurar retry automático quando S3 voltar
```

### 2. Escalation Matrix

| Severidade | Tempo Máximo | Responsável | Ação |
|------------|--------------|-------------|------|
| **P0 - Critical** | 15 minutos | Engenheiro On-Call | Investigação imediata + fix |
| **P1 - High** | 1 hora | Team Lead | Análise + plano de correção |
| **P2 - Medium** | 4 horas | Desenvolvedor | Fix planejado |
| **P3 - Low** | 24 horas | Backlog | Análise + priorização |

### 3. Comunicação de Incidentes

#### Template de Comunicação

```markdown
# INCIDENT: [TÍTULO]

**Status**: [INVESTIGATING/IDENTIFIED/MONITORING/RESOLVED]
**Severidade**: [P0/P1/P2/P3]
**Início**: [TIMESTAMP]
**Duração**: [DURATION]

## Impacto
- [Descrição do impacto para usuários]
- [Serviços afetados]
- [Estimativa de usuários impactados]

## Investigação
- [Causa raiz identificada/suspeita]
- [Ações tomadas]
- [Próximos passos]

## Timeline
- **HH:MM** - Incidente detectado
- **HH:MM** - Equipe notificada
- **HH:MM** - Investigação iniciada
- **HH:MM** - Causa identificada
- **HH:MM** - Fix aplicado
- **HH:MM** - Serviço restaurado

## Lições Aprendidas
- [O que funcionou bem]
- [O que pode ser melhorado]
- [Ações preventivas]
```

---

## 📋 Procedimentos de Manutenção Programada

### 1. Manutenção Semanal

```bash
#!/bin/bash
# weekly-maintenance.sh

echo "🔧 Manutenção Semanal - $(date)"

# 1. Backup de configurações
curl "http://localhost:8080/admin/export-config" -H "apikey: BQYHJGJHJ" > "backup-$(date +%Y%m%d).json"

# 2. Limpeza de logs antigos
find logs/ -name "*.log" -mtime +7 -exec gzip {} \;
find logs/ -name "*.gz" -mtime +30 -delete

# 3. Análise de métricas
curl "http://localhost:8080/queue/stats" -H "apikey: BQYHJGJHJ" | jq . > "metrics-$(date +%Y%m%d).json"

# 4. Verificação de saúde detalhada
./health-monitor.sh > "health-$(date +%Y%m%d).txt"

# 5. Cleanup S3 manual
curl -X POST "http://localhost:8080/cleanup/execute" -H "apikey: BQYHJGJHJ"

echo "✅ Manutenção concluída"
```

### 2. Manutenção Mensal

```bash
#!/bin/bash
# monthly-maintenance.sh

echo "🔧 Manutenção Mensal - $(date)"

# 1. Análise de performance
echo "Gerando relatório de performance..."
./generate-performance-report.sh

# 2. Otimização de banco
echo "Otimizando banco de dados..."
psql $DATABASE_URL -c "VACUUM ANALYZE;"
psql $DATABASE_URL -c "REINDEX DATABASE evolution_api_lite;"

# 3. Análise de filtros
echo "Analisando eficácia dos filtros..."
./analyze-filter-effectiveness.sh

# 4. Review de configurações
echo "Revisando configurações..."
./config-review.sh

# 5. Teste de disaster recovery
echo "Testando backup/restore..."
./test-disaster-recovery.sh

echo "✅ Manutenção mensal concluída"
```

---

**Próximo**: [Troubleshooting](./troubleshooting.md) - Solução de problemas comuns