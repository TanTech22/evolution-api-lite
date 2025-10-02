#!/bin/bash
# 🔗 Monitor de Webhooks - Evolution API
# Monitora webhooks enviados e cria receiver para testes

echo "🔗 INICIANDO MONITORAMENTO DE WEBHOOKS"
echo "====================================="
echo "⏰ $(date)"
echo "🎯 Porta do receiver: 3000"
echo "📍 URL de teste: http://195.35.17.156:3000/webhook"
echo ""

# Verificar se Node.js está disponível
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instalando..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Criar webhook receiver temporário
cat > /tmp/webhook-receiver.js << 'EOF'
const express = require('express');
const app = express();

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cores para console
const colors = {
    reset: '\033[0m',
    bright: '\033[1m',
    red: '\033[31m',
    green: '\033[32m',
    yellow: '\033[33m',
    blue: '\033[34m',
    magenta: '\033[35m',
    cyan: '\033[36m'
};

// Função para log colorido
function logWebhook(method, url, headers, body) {
    const timestamp = new Date().toISOString();

    console.log(`${colors.cyan}🔗 [${timestamp}] WEBHOOK RECEBIDO:${colors.reset}`);
    console.log(`   ${colors.bright}Método:${colors.reset} ${method}`);
    console.log(`   ${colors.bright}URL:${colors.reset} ${url}`);

    // Headers importantes
    if (headers['content-type']) {
        console.log(`   ${colors.bright}Content-Type:${colors.reset} ${headers['content-type']}`);
    }
    if (headers['user-agent']) {
        console.log(`   ${colors.bright}User-Agent:${colors.reset} ${headers['user-agent']}`);
    }
    if (headers['apikey']) {
        console.log(`   ${colors.bright}API Key:${colors.reset} ${headers['apikey']}`);
    }

    // Body
    if (body && Object.keys(body).length > 0) {
        console.log(`   ${colors.bright}Body:${colors.reset}`);

        // Se é evento da Evolution API
        if (body.event) {
            console.log(`     ${colors.yellow}📢 Evento:${colors.reset} ${body.event}`);
        }
        if (body.instance) {
            console.log(`     ${colors.blue}📱 Instância:${colors.reset} ${body.instance}`);
        }
        if (body.data) {
            console.log(`     ${colors.green}📄 Data:${colors.reset} ${JSON.stringify(body.data).substring(0, 200)}...`);
        }
        if (body.server_url) {
            console.log(`     ${colors.magenta}🌐 Server URL:${colors.reset} ${body.server_url}`);
        }

        // Mostrar JSON completo se for pequeno
        const jsonStr = JSON.stringify(body, null, 2);
        if (jsonStr.length < 500) {
            console.log(`     ${colors.bright}JSON completo:${colors.reset}\n${jsonStr}`);
        }
    }

    console.log(`${colors.cyan}----------------------------------------${colors.reset}`);
}

// Contador de webhooks
let webhookCount = 0;

// Handler universal para todos os métodos e rotas
app.all('*', (req, res) => {
    webhookCount++;

    logWebhook(req.method, req.url, req.headers, req.body);

    // Resposta padrão
    const response = {
        status: 'received',
        timestamp: new Date().toISOString(),
        webhook_count: webhookCount,
        method: req.method,
        url: req.url
    };

    res.status(200).json(response);
});

// Endpoint de status
app.get('/status', (req, res) => {
    res.json({
        status: 'running',
        webhooks_received: webhookCount,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`${colors.green}🎯 Webhook Receiver rodando na porta ${PORT}${colors.reset}`);
    console.log(`${colors.bright}📡 URLs de teste:${colors.reset}`);
    console.log(`   http://195.35.17.156:${PORT}/webhook/principal`);
    console.log(`   http://195.35.17.156:${PORT}/webhook/monitor`);
    console.log(`   http://195.35.17.156:${PORT}/webhook/test`);
    console.log(`${colors.cyan}🔍 Status: http://195.35.17.156:${PORT}/status${colors.reset}`);
    console.log(`${colors.yellow}⏰ Aguardando webhooks... (Ctrl+C para parar)${colors.reset}`);
    console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log(`\n${colors.yellow}🏁 Finalizando webhook receiver...${colors.reset}`);
    console.log(`${colors.bright}📊 Total de webhooks recebidos: ${webhookCount}${colors.reset}`);
    process.exit(0);
});
EOF

echo "🚀 Iniciando webhook receiver..."
echo "📋 URLs disponíveis:"
echo "   • Principal: http://195.35.17.156:3000/webhook/principal"
echo "   • Monitor: http://195.35.17.156:3000/webhook/monitor"
echo "   • Status: http://195.35.17.156:3000/status"
echo ""

# Verificar se a porta está livre
if netstat -tulnp | grep ":3000" > /dev/null; then
    echo "⚠️  Porta 3000 já está em uso. Finalizando processo existente..."
    pkill -f "node.*webhook-receiver" || true
    sleep 2
fi

# Executar o receiver
node /tmp/webhook-receiver.js