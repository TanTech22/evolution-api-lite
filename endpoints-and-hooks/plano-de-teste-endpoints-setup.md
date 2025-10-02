Para testar a comunicação entre sua API e webhooks em endereços diferentes, você precisa configurar um ambiente onde:

  1. API Evolution rode em um servidor/IP
  2. Webhook receiver rode em outro endereço
  3. Testes sejam executados de um terceiro local

  🏗️ Configuração de Ambiente Distribuído

  Cenário 1: API Local + Webhook Externo

  # API rodando local
  API_URL="http://localhost:8080"

  # Webhook externo (webhook.site, ngrok, etc)
  WEBHOOK_URL="https://webhook.site/your-unique-id"

  Cenário 2: API Remota + Webhook Local com Túnel

  # API em servidor remoto
  API_URL="http://your-server:8080"

  # Webhook local exposto via ngrok
  ngrok http 3000
  WEBHOOK_URL="https://abc123.ngrok.io"

  Cenário 3: Ambos Remotos

  # API em um servidor
  API_URL="http://server1:8080"

  # Webhook em outro servidor
  WEBHOOK_URL="http://server2:3000/webhook"

  🛠️ Ferramentas Recomendadas

  1. Para Webhook Receiver Temporário:

  # webhook.site - Online, sem setup
  https://webhook.site/

  # httpbin - Para testes simples
  https://httpbin.org/post

  2. Para Túnel Local:

  # ngrok
  npm install -g ngrok
  ngrok http 3000

  # ou localtunnel
  npm install -g localtunnel
  lt --port 3000

  3. Webhook Receiver Local Simples:

  // webhook-receiver.js
  const express = require('express');
  const app = express();

  app.use(express.json());

  app.post('/webhook', (req, res) => {
    console.log('📨 Webhook recebido:', JSON.stringify(req.body, null, 2));
    res.status(200).json({ status: 'received' });
  });

  app.listen(3000, () => {
    console.log('🎯 Webhook receiver rodando na porta 3000');
  });

  📋 Plano de Teste Distribuído

  Passo 1: Setup da API

  # No servidor da API
  cd /root/evolution-api-lite
  npm start
  # API disponível em: http://your-api-server:8080

  Passo 2: Setup do Webhook Receiver

  # Em outro servidor/máquina
  node webhook-receiver.js
  # Se local, expor via ngrok:
  ngrok http 3000
  # Webhook URL: https://abc123.ngrok.io/webhook

  Passo 3: Configurar Webhook Global

  # Configurar webhook na API
  curl -X POST "http://your-api-server:8080/webhook/global/config" \
    -H "Content-Type: application/json" \
    -H "apikey: BQYHJGJHJ" \
    -d '{
      "principal": {
        "enabled": true,
        "url": "https://abc123.ngrok.io/webhook"
      },
      "monitoramento": {
        "enabled": true,
        "url": "https://webhook.site/monitor-id"
      }
    }'

  Passo 4: Executar Testes

  # De qualquer máquina, executar os testes do plano
  export EVOLUTION_API_URL="http://your-api-server:8080"
  export TEST_API_KEY="BQYHJGJHJ"
  export TEST_INSTANCE="5511930670388"

  # Teste básico de conectividade
  curl -X GET "$EVOLUTION_API_URL/instance/fetchInstances" \
    -H "apikey: $TEST_API_KEY"

  🔄 Testando a Comunicação Webhook

  Teste 1: Verificar Configuração

  curl -X GET "http://your-api-server:8080/webhook/global/config" \
    -H "apikey: BQYHJGJHJ"

  Teste 2: Testar Webhook Diretamente

  curl -X POST "http://your-api-server:8080/webhook/global/test" \
    -H "Content-Type: application/json" \
    -H "apikey: BQYHJGJHJ" \
    -d '{
      "url": "https://abc123.ngrok.io/webhook",
      "type": "principal"
    }'

  Teste 3: Gerar Evento Real

  # Enviar mensagem que gerará webhook
  curl -X POST "http://your-api-server:8080/message/sendText/5511930670388" \
    -H "Content-Type: application/json" \
    -H "apikey: BQYHJGJHJ" \
    -d '{
      "number": "5511930670388",
      "text": "🧪 Teste de webhook distribuído"
    }'

  📊 Monitoramento da Comunicação

  1. Logs do Webhook Receiver

  # No servidor do webhook, monitore:
  tail -f webhook-logs.txt

  2. Métricas da API

  # Verificar saúde dos webhooks
  curl -X GET "http://your-api-server:8080/webhook/health" \
    -H "apikey: BQYHJGJHJ"

  # Verificar métricas
  curl -X GET "http://your-api-server:8080/webhook/metrics" \
    -H "apikey: BQYHJGJHJ"

  3. Logs de Falhas

  # Verificar falhas de webhook
  curl -X GET "http://your-api-server:8080/webhook/failed" \
    -H "apikey: BQYHJGJHJ"

  🚀 Script de Automação

  Quer que eu crie um script que automatize esse setup distribuído para facilitar seus testes?