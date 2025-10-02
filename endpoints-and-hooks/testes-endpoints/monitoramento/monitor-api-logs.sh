#!/bin/bash
# 🔍 Monitor de Logs da Evolution API
# Monitora requisições HTTP em tempo real durante execução dos testes

echo "🔍 INICIANDO MONITORAMENTO DE LOGS DA EVOLUTION API"
echo "=================================================="
echo "⏰ $(date)"
echo "📍 Servidor: http://195.35.17.156:8080"
echo "🎯 Monitorando: Requisições HTTP, Respostas, Errors, Database, Webhooks"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Contadores
REQUEST_COUNT=0
SUCCESS_COUNT=0
ERROR_COUNT=0

# Função para log colorido
log_with_color() {
    local color=$1
    local icon=$2
    local category=$3
    local message=$4
    local timestamp=$(date "+%H:%M:%S.%3N")

    printf "${color}${icon} [${timestamp}] ${category}:${NC} ${message}\n"
}

# Monitor do processo Evolution API
API_PID=$(pgrep -f "main.ts" | head -1)
if [ -z "$API_PID" ]; then
    echo "❌ ERRO: Processo Evolution API não encontrado!"
    echo "   Certifique-se de que a API está rodando."
    exit 1
fi

echo "🚀 Processo Evolution API encontrado (PID: $API_PID)"
echo "📊 Iniciando monitoramento..."
echo ""

# Função para monitorar logs do Node.js
monitor_node_logs() {
    # Captura logs do processo Node.js via journalctl ou diretamente
    timeout 1 strace -e trace=network -p $API_PID 2>&1 | grep -E "accept|connect|recv|send" | head -5 2>/dev/null || true
}

# Função para processar linha de log
process_log_line() {
    local line="$1"

    # Incrementar contador de requisições
    if [[ $line =~ (GET|POST|PUT|DELETE|PATCH) ]]; then
        ((REQUEST_COUNT++))
    fi

    # Filtrar requisições HTTP
    if [[ $line =~ "GET /instance/fetchInstances" ]]; then
        log_with_color "$CYAN" "📡" "REQUEST" "GET /instance/fetchInstances"

    elif [[ $line =~ "GET /instance/.*/connectionState" ]]; then
        log_with_color "$CYAN" "📡" "REQUEST" "GET connectionState"

    elif [[ $line =~ "POST /instance/create" ]]; then
        log_with_color "$BLUE" "📡" "REQUEST" "POST /instance/create"

    elif [[ $line =~ "GET /instance/.*/connect" ]]; then
        log_with_color "$PURPLE" "📡" "REQUEST" "GET instance connect (QR Code)"

    elif [[ $line =~ "POST /message/sendText" ]]; then
        log_with_color "$BLUE" "📡" "REQUEST" "POST sendText"

    elif [[ $line =~ "POST /webhook/global/config" ]]; then
        log_with_color "$PURPLE" "📡" "REQUEST" "POST webhook config"

    # Filtrar respostas com status
    elif [[ $line =~ "HTTP.*20[0-9]" ]] || [[ $line =~ "status.*20[0-9]" ]]; then
        ((SUCCESS_COUNT++))
        log_with_color "$GREEN" "✅" "SUCCESS" "HTTP 200 OK"

    elif [[ $line =~ "HTTP.*40[0-9]" ]] || [[ $line =~ "status.*40[0-9]" ]]; then
        ((ERROR_COUNT++))
        log_with_color "$YELLOW" "⚠️" "WARNING" "HTTP 4xx Client Error"

    elif [[ $line =~ "HTTP.*50[0-9]" ]] || [[ $line =~ "status.*50[0-9]" ]]; then
        ((ERROR_COUNT++))
        log_with_color "$RED" "❌" "ERROR" "HTTP 5xx Server Error"

    # Filtrar atividade do Prisma/Database
    elif [[ $line =~ (prisma|database|query|sqlite|SELECT|INSERT|UPDATE|DELETE) ]]; then
        log_with_color "$YELLOW" "🗄️" "DATABASE" "$line"

    # Filtrar webhooks
    elif [[ $line =~ (webhook|callback|curl.*http) ]]; then
        log_with_color "$PURPLE" "🔗" "WEBHOOK" "$line"

    # Filtrar erros importantes
    elif [[ $line =~ (ERROR|FATAL|timeout|failed|exception) ]]; then
        log_with_color "$RED" "💥" "ERROR" "$line"

    # Filtrar warnings
    elif [[ $line =~ (WARN|warning|deprecated) ]]; then
        log_with_color "$YELLOW" "⚠️" "WARN" "$line"

    # QR Code / Connection events
    elif [[ $line =~ (qrcode|connection|open|close|connecting) ]]; then
        log_with_color "$BLUE" "📱" "CONNECTION" "$line"
    fi
}

# Função para mostrar estatísticas
show_stats() {
    echo ""
    echo "📊 ESTATÍSTICAS (últimos dados):"
    echo "   📡 Requisições: $REQUEST_COUNT"
    echo "   ✅ Sucessos: $SUCCESS_COUNT"
    echo "   ❌ Erros: $ERROR_COUNT"
    echo "   🖥️  CPU Evolution API: $(ps -p $API_PID -o %cpu --no-headers 2>/dev/null | tr -d ' ')%"
    echo "   🧠 RAM Evolution API: $(ps -p $API_PID -o %mem --no-headers 2>/dev/null | tr -d ' ')%"
    echo ""
}

# Trap para exibir estatísticas ao sair
trap 'show_stats; echo "🏁 Monitoramento finalizado."; exit 0' INT TERM

# Loop principal de monitoramento
echo "🎯 Monitoramento ativo. Pressione Ctrl+C para parar."
echo "----------------------------------------"

# Monitor combinado: logs do sistema + atividade de rede
while true; do
    # Verificar se o processo ainda existe
    if ! kill -0 $API_PID 2>/dev/null; then
        log_with_color "$RED" "💀" "FATAL" "Processo Evolution API (PID: $API_PID) parou!"
        break
    fi

    # Capturar logs recentes do journalctl para o processo
    journalctl -f -n 0 --since "5 seconds ago" -u "*" 2>/dev/null | timeout 2 grep -i "evolution\|node\|api" | while read -r line; do
        process_log_line "$line"
    done &

    # Monitorar conexões de rede na porta 8080
    netstat_output=$(netstat -tulnp 2>/dev/null | grep ":8080" | head -1)
    if [[ $netstat_output =~ "LISTEN" ]]; then
        connections=$(netstat -an 2>/dev/null | grep ":8080" | grep "ESTABLISHED" | wc -l)
        if [ $connections -gt 0 ]; then
            log_with_color "$CYAN" "🔌" "NETWORK" "Conexões ativas: $connections"
        fi
    fi

    # Verificar arquivos de log específicos se existirem
    if [ -f "/var/log/evolution-api.log" ]; then
        tail -n 1 /var/log/evolution-api.log 2>/dev/null | while read -r line; do
            process_log_line "$line"
        done
    fi

    # Mostrar estatísticas a cada 30 segundos
    if [ $(($(date +%s) % 30)) -eq 0 ]; then
        show_stats
    fi

    sleep 1
done

show_stats
echo "🏁 Monitoramento finalizado."