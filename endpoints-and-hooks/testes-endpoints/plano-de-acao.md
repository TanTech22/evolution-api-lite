# 🎯 **Plano de Ação - Sistema de Testes Distribuídos**

## 📊 **Análise da Situação Atual**

### **✅ Problemas Resolvidos:**
1. **Deadlock Prisma**: API travava no endpoint `fetchInstances` - **RESOLVIDO** com restart
2. **Acesso Externo**: IP incorreto (195.35.17.158 ≠ 195.35.17.156) - **CORRIGIDO**
3. **QR-Screen Auto-calls**: Chamadas automáticas desabilitadas - **IMPLEMENTADO**

### **🎯 Status Atual:**
- ✅ API funcionando: `http://195.35.17.156:8080`
- ✅ Endpoint fetchInstances: Retorna `[]` instantaneamente
- ✅ Acesso local e externo funcionando
- ✅ Plano de teste com 110 itens (108 endpoints + 2 webhooks)

---

## 🚀 **FASE 1: LOGS DETALHADOS DA API**

### **Objetivo:**
Monitorar requisições HTTP em tempo real durante execução dos testes.

### **Implementação:**

#### **1.1 Script de Monitoramento (Servidor)**
```bash
# /monitoramento/monitor-api-logs.sh
#!/bin/bash
# Monitora logs da Evolution API em tempo real

echo "🔍 Iniciando monitoramento de logs da Evolution API..."
echo "⏰ $(date)"
echo "📍 Servidor: http://195.35.17.156:8080"
echo "----------------------------------------"

# Terminal com logs coloridos e filtrados
tail -f /root/.pm2/logs/evolution-api-error.log \
     -f /root/.pm2/logs/evolution-api-out.log 2>/dev/null | \
while IFS= read -r line; do
    timestamp=$(date "+%H:%M:%S")

    # Filtrar requisições HTTP
    if [[ $line =~ "GET\|POST\|PUT\|DELETE" ]]; then
        echo "🌐 [$timestamp] REQUEST: $line"

    # Filtrar respostas com status
    elif [[ $line =~ "HTTP.*[0-9]{3}" ]]; then
        if [[ $line =~ "20[0-9]" ]]; then
            echo "✅ [$timestamp] SUCCESS: $line"
        elif [[ $line =~ "40[0-9]\|50[0-9]" ]]; then
            echo "❌ [$timestamp] ERROR: $line"
        fi

    # Filtrar atividade do Prisma
    elif [[ $line =~ "prisma\|database\|query" ]]; then
        echo "🗄️  [$timestamp] DATABASE: $line"

    # Filtrar webhooks
    elif [[ $line =~ "webhook\|callback" ]]; then
        echo "🔗 [$timestamp] WEBHOOK: $line"

    # Outros logs importantes
    elif [[ $line =~ "ERROR\|WARN\|FATAL" ]]; then
        echo "⚠️  [$timestamp] ALERT: $line"
    fi
done
```

#### **1.2 Script de Teste Básico (Local)**
```bash
# /scripts/test-phase-1.sh
#!/bin/bash
# Testes básicos - ZERO RISCO

SERVER_URL=${1:-"http://195.35.17.156:8080"}
API_KEY="BQYHJGJHJ"
INSTANCE="5511930670388"  # Instância de teste oficial

echo "🧪 FASE 1: TESTES BÁSICOS (3 Endpoints)"
echo "🎯 Servidor: $SERVER_URL"
echo "🔑 API Key: $API_KEY"
echo "----------------------------------------"

# Teste 1: Status da API
echo "📡 Teste 1: Status da API"
response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$SERVER_URL/" -H "Accept: application/json")
http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
content=$(echo $response | sed -e 's/HTTPSTATUS:.*//')

if [ "$http_code" -eq 200 ]; then
    echo "✅ SUCESSO - Status 200"
    echo "📄 Resposta: $content"
else
    echo "❌ FALHOU - Status $http_code"
fi
echo ""

# Teste 2: Listar Instâncias
echo "📡 Teste 2: Listar Instâncias"
response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$SERVER_URL/instance/fetchInstances" -H "apikey: $API_KEY")
http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
content=$(echo $response | sed -e 's/HTTPSTATUS:.*//')

if [ "$http_code" -eq 200 ]; then
    echo "✅ SUCESSO - Status 200"
    echo "📄 Resposta: $content"
else
    echo "❌ FALHOU - Status $http_code"
fi
echo ""

# Teste 3: Estado da Conexão
echo "📡 Teste 3: Estado da Conexão"
response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$SERVER_URL/instance/$INSTANCE/connectionState" -H "apikey: $API_KEY")
http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
content=$(echo $response | sed -e 's/HTTPSTATUS:.*//')

if [ "$http_code" -eq 200 ]; then
    echo "✅ SUCESSO - Status 200"
    echo "📄 Resposta: $content"
else
    echo "❌ FALHOU - Status $http_code"
    echo "📄 Resposta: $content"
fi

echo ""
echo "🏁 FASE 1 CONCLUÍDA"
```

---

## 🔗 **FASE 2: WEBHOOKS E CALLBACKS**

### **Objetivo:**
Monitorar webhooks enviados pela API e validar callbacks.

### **Implementação:**

#### **2.1 Configuração de Webhook Receiver**
```bash
# /monitoramento/monitor-webhooks.sh
#!/bin/bash
# Monitora webhooks enviados e recebidos

echo "🔗 Iniciando monitoramento de webhooks..."

# Criar servidor simples para receber webhooks
cat > /tmp/webhook-receiver.js << 'EOF'
const express = require('express');
const app = express();
app.use(express.json());

app.all('*', (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`🔗 [${timestamp}] WEBHOOK RECEBIDO:`);
    console.log(`   Método: ${req.method}`);
    console.log(`   URL: ${req.url}`);
    console.log(`   Headers: ${JSON.stringify(req.headers, null, 2)}`);
    console.log(`   Body: ${JSON.stringify(req.body, null, 2)}`);
    console.log('----------------------------------------');

    res.status(200).json({ status: 'received', timestamp });
});

app.listen(3000, () => {
    console.log('🎯 Webhook receiver rodando na porta 3000');
});
EOF

node /tmp/webhook-receiver.js
```

#### **2.2 URLs de Teste**
```json
{
  "webhook_urls": {
    "principal": "http://195.35.17.156:3000/webhook/principal",
    "monitoramento": "http://195.35.17.156:3000/webhook/monitor",
    "teste_externo": "https://webhook.site/unique-id"
  }
}
```

---

## 🗄️ **FASE 3: ATIVIDADE DO BANCO DE DADOS**

### **Objetivo:**
Monitorar queries Prisma e performance do SQLite.

### **Implementação:**

#### **3.1 Monitor de Database**
```bash
# /monitoramento/monitor-database.sh
#!/bin/bash
# Monitora atividade do banco de dados

echo "🗄️ Iniciando monitoramento do banco de dados..."

# Monitor SQLite em tempo real
while true; do
    timestamp=$(date "+%H:%M:%S")

    # Contadores de registros
    instances=$(sqlite3 /root/evolution-api-lite/prisma/dev.db "SELECT COUNT(*) FROM Instance;")
    messages=$(sqlite3 /root/evolution-api-lite/prisma/dev.db "SELECT COUNT(*) FROM Message;")
    chats=$(sqlite3 /root/evolution-api-lite/prisma/dev.db "SELECT COUNT(*) FROM Chat;")

    echo "📊 [$timestamp] Instâncias: $instances | Mensagens: $messages | Chats: $chats"

    # Verificar locks
    if lsof /root/evolution-api-lite/prisma/dev.db > /dev/null 2>&1; then
        echo "🔒 [$timestamp] Database está em uso"
    fi

    sleep 2
done
```

#### **3.2 Query Performance Monitor**
```bash
# Script para monitorar queries lentas
echo "🐌 Queries que demoram > 1s serão logadas..."
# Implementação com strace ou profiling do Prisma
```

---

## 📈 **FASE 4: MÉTRICAS DE PERFORMANCE**

### **Objetivo:**
Dashboard em tempo real de métricas do servidor.

### **Implementação:**

#### **4.1 Monitor de Performance**
```bash
# /monitoramento/monitor-performance.sh
#!/bin/bash
# Dashboard de métricas em tempo real

echo "📈 Iniciando dashboard de performance..."

while true; do
    clear
    echo "🖥️  DASHBOARD DE PERFORMANCE - $(date)"
    echo "========================================"

    # CPU e Memória
    echo "💻 CPU: $(top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1)%"
    echo "🧠 RAM: $(free -h | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"

    # Network
    echo "🌐 Conexões ativas na porta 8080: $(netstat -an | grep :8080 | grep ESTABLISHED | wc -l)"

    # Evolution API Process
    api_pid=$(pgrep -f "main.ts")
    if [ ! -z "$api_pid" ]; then
        api_cpu=$(ps -p $api_pid -o %cpu --no-headers | tr -d ' ')
        api_mem=$(ps -p $api_pid -o %mem --no-headers | tr -d ' ')
        echo "🚀 Evolution API - CPU: ${api_cpu}% | RAM: ${api_mem}%"
    fi

    # Database size
    db_size=$(du -h /root/evolution-api-lite/prisma/dev.db | cut -f1)
    echo "🗄️ Database: $db_size"

    echo ""
    echo "⏰ Atualização a cada 5s... (Ctrl+C para sair)"
    sleep 5
done
```

---

## 🎯 **CRONOGRAMA DE EXECUÇÃO**

### **Dia 1: Setup e Fase 1**
- ✅ Criar estrutura de pastas
- 🔄 Implementar monitoramento de logs
- 🔄 Criar scripts de teste básicos
- ⏳ Executar testes da Fase 1 (3 endpoints)

### **Dia 2: Fase 2 e 3**
- ⏳ Configurar webhooks receiver
- ⏳ Implementar monitoramento de database
- ⏳ Executar testes das Fases 2-3 (70+ endpoints)

### **Dia 3: Fase 4 e Relatório**
- ⏳ Dashboard de performance
- ⏳ Testes completos (110 itens)
- ⏳ Relatório final e análises

---

## 🛠️ **Instruções de Uso**

### **Para o Servidor (195.35.17.156):**
```bash
cd /root/evolution-api-lite/endpoints-and-hooks/testes-endpoints

# Terminal 1: Logs da API
./monitoramento/monitor-api-logs.sh

# Terminal 2: Performance (opcional)
./monitoramento/monitor-performance.sh
```

### **Para Sua Máquina Local:**
```bash
# Baixar e executar scripts
wget http://195.35.17.156:8080/static/test-phase-1.sh
chmod +x test-phase-1.sh
./test-phase-1.sh http://195.35.17.156:8080
```

---

## 📊 **Métricas de Sucesso**

- ✅ **100% dos endpoints** testados (108 + 2 webhooks)
- ✅ **Tempo de resposta** < 2s para 95% dos endpoints
- ✅ **Zero downtime** durante os testes
- ✅ **Relatório completo** com análises

---

**Status**: 🔄 **EM IMPLEMENTAÇÃO**
**Próximo passo**: Implementar monitoramento de logs (Fase 1)