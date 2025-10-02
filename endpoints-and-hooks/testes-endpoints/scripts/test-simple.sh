#!/bin/bash
# 🧪 TESTE SIMPLES - Evolution API
# Versão simplificada para validar o sistema

SERVER_URL="http://195.35.17.156:8080"
API_KEY="BQYHJGJHJ"

echo "🧪 TESTE SIMPLES - EVOLUTION API"
echo "================================"
echo "🎯 Servidor: $SERVER_URL"
echo "🔑 API Key: $API_KEY"
echo ""

# Teste 1: Status da API
echo "📡 Teste 1: Status da API"
response=$(curl -s "$SERVER_URL/")
status=$(curl -s -w "%{http_code}" -o /dev/null "$SERVER_URL/")
echo "   Status: $status"
echo "   Resposta: $response"
echo ""

# Teste 2: Listar Instâncias
echo "📡 Teste 2: Listar Instâncias"
response=$(curl -s "$SERVER_URL/instance/fetchInstances" -H "apikey: $API_KEY")
status=$(curl -s -w "%{http_code}" -o /dev/null "$SERVER_URL/instance/fetchInstances" -H "apikey: $API_KEY")
echo "   Status: $status"
echo "   Resposta: $response"
echo ""

# Teste 3: QR Screen
echo "📡 Teste 3: QR Screen"
response=$(curl -s "$SERVER_URL/qr-screen" | head -1)
status=$(curl -s -w "%{http_code}" -o /dev/null "$SERVER_URL/qr-screen")
echo "   Status: $status"
echo "   HTML: $response"
echo ""

echo "🏁 Teste concluído!"

# Verificar se todos retornaram 200
if [ "$status" = "200" ]; then
    echo "✅ Sistema funcionando corretamente!"
    exit 0
else
    echo "❌ Alguns problemas encontrados"
    exit 1
fi