# 🚀 **INSTRUÇÕES DE USO - Sistema de Testes Distribuídos**

## 📋 **Pré-requisitos**

### **Configurações de Teste:**
- **Servidor**: http://195.35.17.156:8080
- **API Key**: `BQYHJGJHJ`
- **Instância de teste**: `5511930670388`

### **No Servidor (195.35.17.156):**
- ✅ Evolution API rodando na porta 8080
- ✅ Node.js instalado (para webhook receiver)
- ✅ SQLite3 disponível
- ✅ Ferramentas básicas: curl, bc, netstat, lsof

### **Na Sua Máquina Local:**
- ✅ curl instalado
- ✅ Conexão com o servidor remoto

---

## 🎯 **CENÁRIO 1: EXECUÇÃO BÁSICA (Recomendado)**

### **Passo 1: No Servidor - Iniciar Monitoramento**
```bash
# Abrir 3 terminais no servidor

# Terminal 1: Logs da API
cd /root/evolution-api-lite/endpoints-and-hooks/testes-endpoints
./monitoramento/monitor-api-logs.sh

# Terminal 2: Performance (opcional)
./monitoramento/monitor-performance.sh

# Terminal 3: Database (opcional)
./monitoramento/monitor-database.sh
```

### **Passo 2: Na Sua Máquina - Executar Testes**
```bash
# Baixar script de teste básico
wget http://195.35.17.156:8080/static/test-phase-1.sh
chmod +x test-phase-1.sh

# Executar testes básicos
./test-phase-1.sh http://195.35.17.156:8080
```

---

## 🔄 **CENÁRIO 2: EXECUÇÃO COMPLETA COM WEBHOOKS**

### **Passo 1: Configurar Webhook Receiver**
```bash
# No servidor (Terminal 4)
cd /root/evolution-api-lite/endpoints-and-hooks/testes-endpoints
./monitoramento/monitor-webhooks.sh
```

### **Passo 2: Configurar Webhooks na API**
```bash
# Da sua máquina local
curl -X POST "http://195.35.17.156:8080/webhook/global/config" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "principal": {
      "enabled": true,
      "url": "http://195.35.17.156:3000/webhook/principal"
    },
    "monitoramento": {
      "enabled": true,
      "url": "http://195.35.17.156:3000/webhook/monitor"
    }
  }'
```

### **Passo 3: Testar Webhook**
```bash
curl -X POST "http://195.35.17.156:8080/webhook/global/test" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "url": "http://195.35.17.156:3000/webhook/test",
    "type": "principal"
  }'
```

---

## 📊 **MONITORAMENTO EM TEMPO REAL**

### **O que observar em cada terminal:**

#### **Terminal 1: API Logs**
- 📡 Requisições HTTP recebidas
- ✅ Status de resposta (200, 400, 500)
- 🗄️ Atividade do banco de dados
- 🔗 Webhooks enviados
- ❌ Erros e warnings

#### **Terminal 2: Performance**
- 🖥️ CPU e RAM do sistema
- 🚀 CPU e RAM da Evolution API
- 🌐 Conexões ativas na porta 8080
- 💾 Uso de disco e database
- ⚡ Status geral

#### **Terminal 3: Database**
- 📊 Contadores de registros
- 🔒 Locks e processos usando DB
- ⏱️ Performance de queries
- 📝 Modo WAL/Journal
- ✅ Integridade do banco

#### **Terminal 4: Webhooks**
- 🔗 Webhooks recebidos
- 📄 Payloads completos
- 📱 Eventos da Evolution API
- ⏰ Timestamps

---

## 🧪 **SCRIPTS DE TESTE DISPONÍVEIS**

### **Teste Básico (Sua máquina):**
```bash
# Executar do servidor para facilitar
cd /root/evolution-api-lite/endpoints-and-hooks/testes-endpoints
./scripts/test-phase-1.sh
```

### **Comandos Manuais:**
```bash
# Status da API
curl -X GET "http://195.35.17.156:8080/" \
  -H "Accept: application/json"

# Listar instâncias
curl -X GET "http://195.35.17.156:8080/instance/fetchInstances" \
  -H "apikey: BQYHJGJHJ"

# Estado de conexão (Instância de teste: 5511930670388)
curl -X GET "http://195.35.17.156:8080/instance/5511930670388/connectionState" \
  -H "apikey: BQYHJGJHJ"

# Criar instância de teste
curl -X POST "http://195.35.17.156:8080/instance/create" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "instanceName": "teste-distribuido",
    "integration": "WHATSAPP-BAILEYS"
  }'
```

---

## 📈 **INTERPRETANDO OS RESULTADOS**

### **Resultados Esperados:**

#### **Teste 1: Status da API**
```json
{
  "status": 200,
  "message": "Welcome to the Evolution API, it is working!",
  "version": "2.2.1"
}
```

#### **Teste 2: Listar Instâncias**
```json
[]
```
*Array vazio é normal se não há instâncias criadas*

#### **Teste 3: Estado da Conexão**
```json
{
  "instance": {
    "state": "close"
  }
}
```
*"close" é normal para instância não conectada*

### **Sinais de Problema:**
- ❌ Timeout em qualquer requisição
- ❌ Status HTTP diferente de 200
- ❌ CPU > 90% por mais de 1 minuto
- ❌ RAM > 90%
- ❌ Erros no log da API
- ❌ Database locks prolongados

---

## 🛠️ **RESOLUÇÃO DE PROBLEMAS**

### **API não responde:**
```bash
# Verificar se está rodando
ps aux | grep "main.ts"

# Reiniciar se necessário
cd /root/evolution-api-lite
npm run start
```

### **Webhook receiver não funciona:**
```bash
# Verificar porta 3000
netstat -tlnp | grep 3000

# Instalar Node.js se necessário
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### **Logs não aparecem:**
```bash
# Verificar PID da Evolution API
pgrep -f "main.ts"

# Verificar logs do sistema
journalctl -f -u "*" | grep -i evolution
```

---

## 📝 **LOGS E RELATÓRIOS**

### **Localização dos Logs:**
- **Logs de teste**: `./resultados/logs/phase-X-YYYYMMDD-HHMMSS.log`
- **Relatórios JSON**: `./resultados/logs/phase-X-YYYYMMDD-HHMMSS.log.json`
- **Configurações**: `./configs/`

### **Exemplo de Relatório JSON:**
```json
{
  "phase": 1,
  "name": "Testes Básicos",
  "server_url": "http://195.35.17.156:8080",
  "timestamp": "2025-10-02T12:00:00Z",
  "total_tests": 3,
  "passed_tests": 3,
  "failed_tests": 0,
  "success_rate": 100.0,
  "status": "PASSED"
}
```

---

## 🎯 **PRÓXIMOS PASSOS**

1. **Executar Fase 1** (3 endpoints básicos)
2. **Analisar resultados** e logs
3. **Configurar webhooks** se necessário
4. **Executar fases subsequentes** conforme plano
5. **Gerar relatório final** com todas as métricas

---

## 🚨 **DICAS IMPORTANTES**

- ⚠️ **Sempre** monitorar logs durante os testes
- ⚠️ **Pausar** entre fases se detectar problemas
- ⚠️ **Backup** do database antes de testes extensivos
- ⚠️ **Verificar** recursos disponíveis (CPU/RAM)
- ⚠️ **Documentar** qualquer comportamento anômalo

---

**🎉 Sistema pronto para uso!**

Execute os comandos na ordem descrita e observe os terminais para acompanhar em tempo real o comportamento da API durante os testes.