# Troubleshooting - Sistema de Fila Global

## 🔧 Problemas Comuns e Soluções

### 1. Problemas de Fila

#### ❌ Problema: Fila crescendo constantemente

**Sintomas:**
- Queue size aumentando continuamente
- Rate limit constantemente esgotado
- Latência alta no processamento

**Diagnóstico:**
```bash
# Verificar tamanho da fila
curl "http://localhost:8080/queue/stats" -H "apikey: BQYHJGJHJ"

# Verificar logs de erro
grep "rate.limit" logs/queue.log | tail -20

# Verificar distribuição por instância
grep "enqueue" logs/queue.log | jq -r '.instanceName' | sort | uniq -c | sort -nr
```

**Soluções:**

1. **Aumentar Rate Limit Temporariamente:**
```bash
curl -X PUT "http://localhost:8080/config/rate-limit" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "capacity": 1000,
    "refillRate": 1000,
    "duration": 3600000
  }'
```

2. **Aplicar Filtros Emergenciais:**
```bash
curl -X POST "http://localhost:8080/filters/emergency" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "enabled": true,
    "minDurationSeconds": 10,
    "maxDurationSeconds": 30,
    "reason": "Emergency filter - high load"
  }'
```

3. **Identificar Instâncias Problemáticas:**
```bash
# Listar top 10 instâncias por volume
grep "enqueue" logs/queue.log | \
  jq -r '.instanceName' | \
  sort | uniq -c | sort -nr | head -10

# Aplicar filtro específico para instância problemática
curl -X PUT "http://localhost:8080/instance/PROBLEMA_INSTANCE/filters/audio" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "minDurationSeconds": 15,
    "maxDurationSeconds": 60,
    "enabled": true
  }'
```

#### ❌ Problema: Mensagens sendo perdidas

**Sintomas:**
- Mensagens não chegam ao webhook
- Queue stats mostra processamento mas webhook não recebe

**Diagnóstico:**
```bash
# Verificar logs de webhook
grep "webhook.*error" logs/webhook.log | tail -10

# Verificar conectividade do webhook
curl "http://localhost:8080/webhook/global/test" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{"url": "https://your-webhook.com", "type": "principal"}'

# Verificar configuração de webhook
curl "http://localhost:8080/webhook/global/config" -H "apikey: BQYHJGJHJ"
```

**Soluções:**

1. **Verificar e Corrigir URL do Webhook:**
```bash
curl -X PUT "http://localhost:8080/webhook/global/config" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "principal": {
      "enabled": true,
      "url": "https://webhook-correto.com/endpoint"
    }
  }'
```

2. **Configurar Retry Policy:**
```bash
# Habilitar retry automático
curl -X PUT "http://localhost:8080/webhook/config/retry" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "enabled": true,
    "maxRetries": 3,
    "backoffMs": 5000
  }'
```

---

### 2. Problemas de S3/MinIO

#### ❌ Problema: Uploads S3 falhando

**Sintomas:**
- Errors "connection refused" para MinIO
- Mensagens de áudio sendo rejeitadas
- Logs mostram falhas de upload

**Diagnóstico:**
```bash
# Verificar status do MinIO
curl http://localhost:9000/minio/health/live

# Verificar logs S3
grep "s3.*error" logs/s3.log | tail -10

# Verificar espaço em disco
df -h /path/to/minio-data

# Verificar configuração S3
echo $MINIO_ENDPOINT $MINIO_ACCESS_KEY
```

**Soluções:**

1. **Restart do MinIO:**
```bash
# Parar MinIO
pkill minio

# Reiniciar com configurações corretas
MINIO_ROOT_USER=evolution MINIO_ROOT_PASSWORD=evolution123 \
./minio server ./minio-data --console-address ":9001" --address ":9000"
```

2. **Verificar Credenciais:**
```bash
# Testar acesso com credentials
export AWS_ACCESS_KEY_ID=evolution
export AWS_SECRET_ACCESS_KEY=evolution123
aws s3 ls --endpoint-url http://localhost:9000
```

3. **Limpeza de Espaço:**
```bash
# Executar cleanup emergencial
curl -X POST "http://localhost:8080/cleanup/execute" \
  -H "apikey: BQYHJGJHJ"

# Verificar resultado
curl "http://localhost:8080/cleanup/status" \
  -H "apikey: BQYHJGJHJ"
```

#### ❌ Problema: Cleanup S3 não executando

**Sintomas:**
- Arquivos antigos acumulando
- Espaço em disco esgotando
- Cleanup schedule não funciona

**Diagnóstico:**
```bash
# Verificar configuração do cleanup
curl "http://localhost:8080/cleanup/schedule" -H "apikey: BQYHJGJHJ"

# Verificar logs do scheduler
grep "cleanup" logs/application.log | tail -10

# Verificar timezone
timedatectl status
```

**Soluções:**

1. **Reconfigurar Schedule:**
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

2. **Executar Limpeza Manual:**
```bash
curl -X POST "http://localhost:8080/cleanup/execute" \
  -H "apikey: BQYHJGJHJ"
```

---

### 3. Problemas de Processing Feedback

#### ❌ Problema: Reactions não aparecem no WhatsApp

**Sintomas:**
- Processing iniciado mas sem feedback visual
- Usuários não veem reactions de progresso
- Sessions ativas mas sem interação

**Diagnóstico:**
```bash
# Verificar sessões ativas
curl "http://localhost:8080/process/status" -H "apikey: BQYHJGJHJ"

# Verificar logs de reaction
grep "reaction" logs/application.log | tail -10

# Verificar configuração da instância WhatsApp
# (verificar se instância está conectada)
```

**Soluções:**

1. **Verificar Conexão da Instância:**
```bash
# Verificar status da instância WhatsApp
curl "http://localhost:8080/instance/INSTANCE_NAME/connect" \
  -H "apikey: BQYHJGJHJ"
```

2. **Reiniciar Sessão de Processing:**
```bash
# Forçar limpeza e reiniciar
curl -X DELETE "http://localhost:8080/process/INSTANCE:CHAT:MESSAGE" \
  -H "apikey: BQYHJGJHJ"

# Iniciar nova sessão
curl -X POST "http://localhost:8080/process/start" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "instance": "INSTANCE_NAME",
    "chatId": "CHAT_ID",
    "messageId": "MESSAGE_ID"
  }'
```

#### ❌ Problema: Muitos timeouts de processing

**Sintomas:**
- Reactions 🤷 frequentes
- Sessões expirando antes de finalizar
- Processing time muito alto

**Diagnóstico:**
```bash
# Analisar tempo médio de processing
curl "http://localhost:8080/process/status" -H "apikey: BQYHJGJHJ" | \
  jq '.stats.averageProcessingTime'

# Verificar distribuição de timeouts
grep "timeout" logs/application.log | wc -l

# Identificar gargalos
curl "http://localhost:8080/queue/stats" -H "apikey: BQYHJGJHJ"
```

**Soluções:**

1. **Aumentar Timeout:**
```bash
# Configurar timeout maior
export PROCESSING_FEEDBACK_TIMEOUT=900000  # 15 minutos
```

2. **Otimizar Processing:**
```bash
# Aumentar rate limit para reduzir fila
curl -X PUT "http://localhost:8080/config/rate-limit" \
  -d '{"capacity": 1000, "refillRate": 1000}'

# Aplicar filtros para reduzir carga
curl -X PUT "http://localhost:8080/instance/ALL/filters/audio" \
  -d '{"maxDurationSeconds": 120}'
```

---

### 4. Problemas de Webhook

#### ❌ Problema: Webhooks não sendo entregues

**Sintomas:**
- Client systems não recebem dados
- Webhook response time muito alto
- Errors 500/timeout nos webhooks

**Diagnóstico:**
```bash
# Verificar configuração de webhooks
curl "http://localhost:8080/webhook/global/config" -H "apikey: BQYHJGJHJ"

# Testar conectividade
curl "http://localhost:8080/webhook/global/test" \
  -d '{"url": "https://your-webhook.com", "type": "principal"}'

# Verificar logs de webhook
grep "webhook.*error" logs/webhook.log | tail -20
```

**Soluções:**

1. **Verificar URL e Conectividade:**
```bash
# Testar URL manualmente
curl -X POST "https://your-webhook.com/endpoint" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Atualizar URL se necessário
curl -X PUT "http://localhost:8080/webhook/global/config" \
  -d '{"principal": {"url": "https://webhook-correto.com"}}'
```

2. **Configurar Headers de Autenticação:**
```bash
curl -X PUT "http://localhost:8080/webhook/global/config" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "headers": {
      "Authorization": "Bearer YOUR_TOKEN",
      "Content-Type": "application/json"
    }
  }'
```

3. **Habilitar Retry:**
```bash
curl -X PUT "http://localhost:8080/webhook/config/retry" \
  -d '{
    "enabled": true,
    "maxRetries": 5,
    "backoffMs": 10000
  }'
```

---

### 5. Problemas de Database

#### ❌ Problema: Queries lentas

**Sintomas:**
- API responses lentas
- Database connection timeout
- Configurações não carregando

**Diagnóstico:**
```bash
# Verificar conexões ativas
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Verificar queries lentas
psql $DATABASE_URL -c "
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;"

# Verificar tamanho das tabelas
psql $DATABASE_URL -c "
SELECT schemaname,tablename,attname,n_distinct,correlation
FROM pg_stats
WHERE tablename = 'instance_audio_filters';"
```

**Soluções:**

1. **Otimizar Banco:**
```bash
# Executar VACUUM e ANALYZE
psql $DATABASE_URL -c "VACUUM ANALYZE instance_audio_filters;"
psql $DATABASE_URL -c "VACUUM ANALYZE global_webhook_config;"

# Recriar índices
psql $DATABASE_URL -c "REINDEX TABLE instance_audio_filters;"
```

2. **Adicionar Índices Missing:**
```sql
-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_instance_filters_enabled
ON instance_audio_filters(enabled) WHERE enabled = true;

CREATE INDEX IF NOT EXISTS idx_processing_stats_date
ON processing_stats(date DESC);
```

3. **Configurar Connection Pool:**
```env
# Ajustar pool de conexões
DATABASE_POOL_SIZE=20
DATABASE_POOL_TIMEOUT=30000
```

---

### 6. Problemas de Rate Limiting

#### ❌ Problema: Rate limit muito restritivo

**Sintomas:**
- Muitas mensagens sendo rejeitadas
- Tokens sempre baixos
- Users reclamando de lentidão

**Diagnóstico:**
```bash
# Verificar status do rate limit
curl "http://localhost:8080/queue/stats" -H "apikey: BQYHJGJHJ" | \
  jq '.rateLimitStatus'

# Analisar padrão de consumo
grep "rate.limit" logs/queue.log | \
  awk '{print $1, $2}' | \
  sort | uniq -c
```

**Soluções:**

1. **Ajustar Configuração:**
```bash
# Aumentar capacidade
curl -X PUT "http://localhost:8080/config/rate-limit" \
  -d '{
    "capacity": 1000,
    "refillRate": 1000,
    "refillInterval": 60000
  }'
```

2. **Implementar Rate Limiting por Instância:**
```bash
# Configurar limite específico para instâncias VIP
curl -X PUT "http://localhost:8080/instance/VIP_INSTANCE/rate-limit" \
  -d '{
    "capacity": 100,
    "refillRate": 100
  }'
```

---

## 🔍 Ferramentas de Diagnóstico

### 1. Script de Diagnóstico Completo

```bash
#!/bin/bash
# diagnosis.sh

echo "🔍 DIAGNÓSTICO COMPLETO - $(date)"
echo "=================================="

API_KEY="BQYHJGJHJ"
BASE_URL="http://localhost:8080"

# 1. Health Check Geral
echo "1. HEALTH CHECK"
health=$(curl -s "$BASE_URL/health" -H "apikey: $API_KEY")
echo "Status: $(echo $health | jq -r '.status')"
echo "Uptime: $(echo $health | jq -r '.uptime')"
echo ""

# 2. Status da Fila
echo "2. FILA GLOBAL"
queue_stats=$(curl -s "$BASE_URL/queue/stats" -H "apikey: $API_KEY")
echo "Tamanho da fila: $(echo $queue_stats | jq -r '.queueSize')"
echo "Processadas hoje: $(echo $queue_stats | jq -r '.processedToday')"
echo "Rate limit tokens: $(echo $queue_stats | jq -r '.rateLimitStatus.tokens')"
echo ""

# 3. Processing Feedback
echo "3. PROCESSING FEEDBACK"
process_status=$(curl -s "$BASE_URL/process/status" -H "apikey: $API_KEY")
echo "Sessões ativas: $(echo $process_status | jq -r '.activeSessionsCount')"
echo "Tempo médio: $(echo $process_status | jq -r '.stats.averageProcessingTime')ms"
echo ""

# 4. S3 Cleanup
echo "4. S3 CLEANUP"
cleanup_status=$(curl -s "$BASE_URL/cleanup/status" -H "apikey: $API_KEY")
echo "Enabled: $(echo $cleanup_status | jq -r '.enabled')"
echo "Próxima execução: $(echo $cleanup_status | jq -r '.nextExecution')"
echo ""

# 5. Webhook Config
echo "5. WEBHOOK CONFIG"
webhook_config=$(curl -s "$BASE_URL/webhook/global/config" -H "apikey: $API_KEY")
echo "Principal habilitado: $(echo $webhook_config | jq -r '.data.principal.enabled')"
echo "Monitoring habilitado: $(echo $webhook_config | jq -r '.data.monitoramento.enabled')"
echo ""

# 6. Verificar Serviços
echo "6. SERVIÇOS DEPENDENTES"
# PostgreSQL
if pg_isready -q; then
  echo "PostgreSQL: ✅ OK"
else
  echo "PostgreSQL: ❌ ERRO"
fi

# RabbitMQ
if curl -s http://localhost:15672 > /dev/null; then
  echo "RabbitMQ: ✅ OK"
else
  echo "RabbitMQ: ❌ ERRO"
fi

# MinIO
if curl -s http://localhost:9000/minio/health/live > /dev/null; then
  echo "MinIO: ✅ OK"
else
  echo "MinIO: ❌ ERRO"
fi

echo ""

# 7. Análise de Logs
echo "7. ANÁLISE DE LOGS (últimas 24h)"
if [ -f "logs/application.log" ]; then
  errors=$(grep -c '"level":"error"' logs/application.log || echo "0")
  warnings=$(grep -c '"level":"warn"' logs/application.log || echo "0")
  echo "Errors: $errors"
  echo "Warnings: $warnings"
else
  echo "Logs não encontrados"
fi

echo ""
echo "=================================="
echo "Diagnóstico concluído"
```

### 2. Monitor de Performance em Tempo Real

```bash
#!/bin/bash
# real-time-monitor.sh

API_KEY="BQYHJGJHJ"
BASE_URL="http://localhost:8080"

# Limpar tela
clear

while true; do
  # Posicionar cursor no topo
  tput cup 0 0

  echo "🔄 MONITOR TEMPO REAL - $(date)"
  echo "=================================="

  # Queue stats
  queue_stats=$(curl -s "$BASE_URL/queue/stats" -H "apikey: $API_KEY")
  queue_size=$(echo $queue_stats | jq -r '.queueSize')
  tokens=$(echo $queue_stats | jq -r '.rateLimitStatus.tokens')
  capacity=$(echo $queue_stats | jq -r '.rateLimitStatus.capacity')

  echo "Fila: $queue_size mensagens"
  echo "Rate Limit: $tokens/$capacity tokens"

  # Calcular % de uso
  usage=$(echo "scale=1; (($capacity - $tokens) * 100) / $capacity" | bc -l)
  echo "Uso: ${usage}%"

  # Processing sessions
  process_status=$(curl -s "$BASE_URL/process/status" -H "apikey: $API_KEY")
  active_sessions=$(echo $process_status | jq -r '.activeSessionsCount')
  avg_time=$(echo $process_status | jq -r '.stats.averageProcessingTime')

  echo "Sessões ativas: $active_sessions"
  echo "Tempo médio: ${avg_time}ms"

  # Alertas
  echo ""
  echo "ALERTAS:"
  if [ "$queue_size" -gt 500 ]; then
    echo "⚠️  Fila muito grande"
  fi
  if [ "$tokens" -lt 50 ]; then
    echo "⚠️  Rate limit baixo"
  fi
  if [ "$active_sessions" -gt 50 ]; then
    echo "⚠️  Muitas sessões ativas"
  fi

  echo ""
  echo "Ctrl+C para sair"
  echo "=================================="

  # Aguardar 5 segundos
  sleep 5
done
```

### 3. Gerador de Relatório de Análise

```bash
#!/bin/bash
# generate-analysis-report.sh

REPORT_DATE=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="analysis_report_$REPORT_DATE.md"

cat > $REPORT_FILE << EOF
# Relatório de Análise - Sistema de Fila Global

**Data**: $(date)
**Período**: Últimas 24 horas

## Resumo Executivo

EOF

# Coletar dados
API_KEY="BQYHJGJHJ"
BASE_URL="http://localhost:8080"

# Estatísticas atuais
queue_stats=$(curl -s "$BASE_URL/queue/stats" -H "apikey: $API_KEY")

cat >> $REPORT_FILE << EOF
### Métricas Atuais

- **Tamanho da Fila**: $(echo $queue_stats | jq -r '.queueSize') mensagens
- **Processadas Hoje**: $(echo $queue_stats | jq -r '.processedToday')
- **Rate Limit**: $(echo $queue_stats | jq -r '.rateLimitStatus.tokens')/$(echo $queue_stats | jq -r '.rateLimitStatus.capacity') tokens
- **Áudios Filtrados**: $(echo $queue_stats | jq -r '.audioFilterStats.tooShort + .audioFilterStats.tooLong')

### Análise de Logs

EOF

# Análise de logs
if [ -f "logs/application.log" ]; then
  errors=$(grep -c '"level":"error"' logs/application.log)
  warnings=$(grep -c '"level":"warn"' logs/application.log)

  cat >> $REPORT_FILE << EOF
- **Errors**: $errors ocorrências
- **Warnings**: $warnings ocorrências

### Top 5 Instâncias por Volume

\`\`\`
$(grep "enqueue" logs/queue.log | jq -r '.instanceName' | sort | uniq -c | sort -nr | head -5)
\`\`\`

### Distribuição de Erros

\`\`\`
$(grep '"level":"error"' logs/application.log | jq -r '.error' | sort | uniq -c | sort -nr | head -5)
\`\`\`

EOF
fi

cat >> $REPORT_FILE << EOF
## Recomendações

### Ações Imediatas
- [ ] Verificar instâncias com maior volume
- [ ] Analisar erros frequentes
- [ ] Otimizar filtros se necessário

### Ações Preventivas
- [ ] Monitorar rate limit usage
- [ ] Configurar alertas proativos
- [ ] Planejar scaling se necessário

---
*Relatório gerado automaticamente*
EOF

echo "✅ Relatório gerado: $REPORT_FILE"
```

---

## 📞 Contacts de Suporte

### Escalation Contacts

| Componente | Contact | Horário |
|------------|---------|---------|
| **Aplicação** | evolution-dev-team@company.com | 24/7 |
| **Infraestrutura** | infra-team@company.com | Business hours |
| **Database** | dba-team@company.com | Business hours |
| **Monitoring** | monitoring-team@company.com | 24/7 |

### Emergency Procedures

1. **P0 Incidents**: Ligar para on-call engineer
2. **P1 Incidents**: Slack #evolution-incidents
3. **P2/P3**: Email team + JIRA ticket

### Documentation Updates

Para atualizar esta documentação:
1. Criar PR com mudanças
2. Review pelo team lead
3. Merge após aprovação
4. Notificar equipe via Slack

---

**Status**: Documentação completa do sistema de troubleshooting
**Última atualização**: Outubro 2025