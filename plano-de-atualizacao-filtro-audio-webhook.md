# 🎯 Plano de Atualização: Refatoração dos Filtros de Áudio e Webhook

> **Objetivo**: Simplificar configuração de filtros de áudio removendo redundância entre `audioProcessing` do webhook e `audioFilters` da instância.

## 📋 Visão Geral

### 🎯 **Estado Atual (Problemático)**
- ❌ **Duplicação**: Configuração em dois lugares (`audioProcessing` + `audioFilters`)
- ❌ **Confusão**: Usuário precisa configurar webhook E instância
- ❌ **Inconsistência**: Duas fontes de verdade para filtros de áudio

### ✅ **Estado Desejado**
- ✅ **Fonte única**: Apenas `audioFilters` da instância
- ✅ **Configuração simples**: Um único endpoint `/instance/filters/audio/`
- ✅ **Filtro global**: Tamanho 24MB fixo (não configurável)
- ✅ **Filtro personalizado**: Duração por instância via `audioFilters`

---

## 🏗️ Estratégia de Refatoração

### 📊 **Análise de Impacto**
Com base na análise do agente, identificamos que `audioProcessing` é usado em **27 locais** críticos do sistema:

**Componentes Críticos (Requerem Modificação)**:
- ✅ `src/utils/messageFilter.ts` - Sistema principal de filtros
- ✅ `src/api/integrations/channel/whatsapp/whatsapp.baileys.service.ts` - Integração principal
- ⚠️ Schemas Prisma - Campo persistência (manter para compatibilidade)
- ⚠️ DTOs e Validação - Estrutura API (deprecar gradualmente)

**Componentes Opcionais (Atualização Simples)**:
- 📝 Documentação - Atualizar após mudanças
- 🖥️ Dashboard HTML - Ajustar interface
- 🗑️ Linhas comentadas - Remover

---

## 📅 Plano de Execução (6 Fases)

### **FASE 1: PREPARAÇÃO E VALIDAÇÃO** 🔍
> **Duração**: 1-2 horas
> **Objetivo**: Entender estado atual e preparar ambiente

#### **1.1 Análise de Estado Atual**
- [ ] **Criar backup** do estado atual
- [ ] **Documentar** instâncias existentes no banco
- [ ] **Validar** comportamento atual dos filtros
- [ ] **Testar** cenários de uso existentes

**Comandos de Teste**:
```bash
# 1. Verificar instâncias no banco
sqlite3 ./prisma/dev.db "SELECT instanceName, audioFilters FROM AudioFilters;"

# 2. Listar webhooks com audioProcessing
sqlite3 ./prisma/dev.db "SELECT name, audioProcessing FROM Webhook WHERE audioProcessing IS NOT NULL;"

# 3. Backup do banco
cp ./prisma/dev.db ./prisma/dev.db.backup.$(date +%Y%m%d_%H%M%S)
```

#### **1.2 Casos de Teste Base**
- [ ] **Teste A**: Instância com audioFilters + webhook com audioProcessing
- [ ] **Teste B**: Instância só com audioFilters
- [ ] **Teste C**: Webhook só com audioProcessing
- [ ] **Teste D**: Instância sem configuração (defaults)

---

### **FASE 2: MODIFICAÇÃO DO CORE DE FILTROS** ⚙️
> **Duração**: 2-3 horas
> **Objetivo**: Alterar lógica principal de filtragem

#### **2.1 Modificar `messageFilter.ts`**

**Arquivo**: `src/utils/messageFilter.ts`

**Alterações**:
```typescript
// ANTES (linha 213):
function applyAudioFilter(audioSize: number, filters: MessageTypeFilter, remoteJid?: string): FilterResult {
  const audioConfig = filters.audioProcessing;
  if (!audioConfig) return { allowed: true };
  const maxSize = audioConfig.maxSizeBytes || 25165824; // 24MB default

// DEPOIS (nova implementação):
function applyAudioFilter(audioSize: number, filters: MessageTypeFilter, remoteJid?: string): FilterResult {
  // FILTRO GLOBAL FIXO - 24MB sempre
  const GLOBAL_MAX_SIZE_BYTES = 25165824; // 24MB

  if (audioSize > GLOBAL_MAX_SIZE_BYTES) {
    return {
      allowed: false,
      reason: `Audio size ${audioSize} bytes exceeds global limit ${GLOBAL_MAX_SIZE_BYTES} bytes`,
      shouldReplyToOversizeAudio: true,
      oversizeMessage: '⛔', // Reaction fixa global
      remoteJid
    };
  }

  return { allowed: true };
}
```

**Testes**:
- [ ] Áudio < 24MB → ✅ Permitido
- [ ] Áudio > 24MB → ❌ Bloqueado com ⛔
- [ ] Verificar logs de segurança

#### **2.2 Modificar `whatsapp.baileys.service.ts`**

**Arquivo**: `src/api/integrations/channel/whatsapp/whatsapp.baileys.service.ts`

**Alterações**:
```typescript
// ANTES (linhas 3585-3586):
if (webhookConfig.audioProcessing && typeof webhookConfig.audioProcessing === 'object') {
  filters.audioProcessing = webhookConfig.audioProcessing as any;
}

// DEPOIS (remover completamente):
// Linha removida - não usa mais audioProcessing do webhook
```

**Testes**:
- [ ] Instância com webhook → Filtros funcionam
- [ ] Instância sem webhook → Defaults aplicados
- [ ] Logs confirmam uso apenas de audioFilters

---

### **FASE 3: VALIDAÇÃO DE FUNCIONALIDADE** ✅
> **Duração**: 1-2 horas
> **Objetivo**: Garantir que mudanças funcionam corretamente

#### **3.1 Testes de Filtro de Tamanho**
```bash
# Teste com áudio pequeno (deve passar)
curl -X POST "http://localhost:8080/instance/create" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "instanceName": "test-size-small",
    "audioFilters": {"enabled": true, "minDurationSeconds": 1, "maxDurationSeconds": 60}
  }'

# Teste com áudio grande (deve bloquear com ⛔)
# (Simular envio de áudio > 24MB)
```

#### **3.2 Testes de Filtro de Duração**
```bash
# Teste duração curta (deve bloquear)
curl -X PUT "http://localhost:8080/instance/filters/audio/test-duration" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "enabled": true,
    "minDurationSeconds": 10,
    "maxDurationSeconds": 60,
    "replyToOversizeAudio": true,
    "oversizeReaction": "⚠️"
  }'
```

#### **3.3 Testes de Integração**
- [ ] **Criar instância** → audioFilters criados automaticamente
- [ ] **Enviar áudio válido** → Passa por todos os filtros
- [ ] **Enviar áudio inválido** → Bloqueado apropriadamente
- [ ] **Verificar banco** → Dados salvos corretamente

---

### **FASE 4: COMPATIBILIDADE REVERSA** 🔄
> **Duração**: 1-2 horas
> **Objetivo**: Manter compatibilidade com configurações existentes

#### **4.1 Deprecação Gradual**

**Estratégia**: Manter campos `audioProcessing` mas ignorar na lógica de filtros

**Alterações**:
- [ ] **Manter schemas** - Não quebrar APIs existentes
- [ ] **Ignorar configuração** - audioProcessing não afeta filtros
- [ ] **Adicionar logs de aviso** - Notificar sobre deprecação

```typescript
// Em whatsapp.baileys.service.ts - adicionar log de deprecação
if (webhookConfig.audioProcessing) {
  this.logger.warn(`[DEPRECATED] audioProcessing in webhook is deprecated. Use /instance/filters/audio/ instead.`);
}
```

#### **4.2 Migração de Dados**
- [ ] **Script de migração** para instâncias existentes
- [ ] **Validar** dados migrados
- [ ] **Testar** cenários mistos

---

### **FASE 5: ATUALIZAÇÃO DE DOCUMENTAÇÃO** 📖
> **Duração**: 1 hora
> **Objetivo**: Atualizar documentação para refletir mudanças

#### **5.1 Atualizar Arquivos de Documentação**
- [ ] `endpoints-and-hooks/custom/description.md`
- [ ] `endpoints-and-hooks/custom/filters.md`
- [ ] `endpoints-and-hooks/custom/map.json`

#### **5.2 Novos Exemplos**
```json
// Novo exemplo simplificado
{
  "instanceName": "bot-simples",
  "audioFilters": {
    "enabled": true,
    "minDurationSeconds": 3,
    "maxDurationSeconds": 300,
    "replyToOversizeAudio": true,
    "oversizeReaction": "⚠️"
  }
  // webhook NÃO precisa mais de audioProcessing
}
```

#### **5.3 Atualizar Dashboard**
- [ ] Remover exibição de `audioProcessing`
- [ ] Focar apenas em `audioFilters`
- [ ] Adicionar indicação de filtro global de tamanho

---

### **FASE 6: TESTES FINAIS E DEPLOY** 🚀
> **Duração**: 1 hora
> **Objetivo**: Validação final e documentação

#### **6.1 Suite de Testes Completa**
```bash
# Script de teste automatizado
cat > test-audio-filters.sh << 'EOF'
#!/bin/bash
echo "🎯 Testando Filtros de Áudio Refatorados"

# 1. Criar instância simples
echo "1. Criando instância simples..."
curl -X POST "http://localhost:8080/instance/create" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{"instanceName": "test-final", "audioFilters": {"enabled": true}}'

# 2. Verificar audioFilters no banco
echo "2. Verificando banco..."
sqlite3 ./prisma/dev.db "SELECT * FROM AudioFilters WHERE instanceName='test-final';"

# 3. Testar endpoint de configuração
echo "3. Testando configuração..."
curl "http://localhost:8080/instance/filters/audio/test-final" -H "apikey: BQYHJGJHJ"

# 4. Limpeza
echo "4. Limpeza..."
curl -X DELETE "http://localhost:8080/instance/test-final/delete" -H "apikey: BQYHJGJHJ"

echo "✅ Testes concluídos!"
EOF

chmod +x test-audio-filters.sh
./test-audio-filters.sh
```

#### **6.2 Checklist Final**
- [ ] ✅ Filtro de tamanho global (24MB) funcionando
- [ ] ✅ Filtro de duração por instância funcionando
- [ ] ✅ Configuração única via `/instance/filters/audio/`
- [ ] ✅ Compatibilidade com instâncias existentes
- [ ] ✅ Documentação atualizada
- [ ] ✅ Testes passando
- [ ] ✅ Logs de deprecação funcionando

---

## 🛡️ Plano de Rollback

### **Se algo der errado**:
1. **Restaurar backup**: `cp ./prisma/dev.db.backup.* ./prisma/dev.db`
2. **Reverter código**: `git checkout HEAD~1 -- src/utils/messageFilter.ts src/api/integrations/channel/whatsapp/whatsapp.baileys.service.ts`
3. **Reiniciar serviço**: `npm run start`

---

## 📊 Métricas de Sucesso

### **KPIs para Validar Sucesso**:
- ✅ **Configuração única**: Só precisa configurar `/instance/filters/audio/`
- ✅ **Filtro global**: Todos os áudios > 24MB bloqueados
- ✅ **Filtro personalizado**: Duração respeitada por instância
- ✅ **Performance**: Não degradação no tempo de resposta
- ✅ **Compatibilidade**: Instâncias existentes funcionando

### **Logs de Validação**:
```
[SECURITY] Using instance-specific audio duration filter: 3-300s
[SECURITY] Message BLOCKED by size filter: Audio size 26214400 bytes exceeds global limit 25165824 bytes
[SECURITY] Audio BLOCKED by duration filter: Duration 5 seconds below minimum 10 seconds
```

---

## 🚀 Próximos Passos

Após completar este plano:
1. **Deprecar oficialmente** `audioProcessing` na próxima versão
2. **Remover campos** do schema em versão futura
3. **Simplificar DTOs** removendo audioProcessing
4. **Criar migração automática** para converter configurações existentes

**Pronto para começar a Fase 1?** 🎯