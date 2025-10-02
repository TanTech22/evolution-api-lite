#!/bin/bash
# 📈 Dashboard de Performance - Evolution API
# Monitor em tempo real de métricas do servidor

echo "📈 DASHBOARD DE PERFORMANCE - EVOLUTION API"
echo "==========================================="
echo "⏰ $(date)"
echo "🖥️  Servidor: 195.35.17.156:8080"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Variáveis de controle
UPDATE_INTERVAL=5
API_PID=""
PREV_RX_BYTES=0
PREV_TX_BYTES=0
PREV_TIME=0

# Função para encontrar PID da Evolution API
find_api_pid() {
    API_PID=$(pgrep -f "main.ts" | head -1)
    if [ -z "$API_PID" ]; then
        API_PID=$(pgrep -f "evolution" | head -1)
    fi
}

# Função para obter uso de CPU
get_cpu_usage() {
    # CPU total do sistema
    local cpu_total=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    echo "$cpu_total"
}

# Função para obter uso de RAM
get_memory_info() {
    # RAM total e usada
    local mem_info=$(free -m | awk 'NR==2{printf "%.1f %.1f %.1f", $3*100/$2, $3, $2}')
    echo "$mem_info"
}

# Função para obter informações da Evolution API
get_api_info() {
    if [ -n "$API_PID" ] && kill -0 "$API_PID" 2>/dev/null; then
        # CPU e RAM do processo
        local api_cpu=$(ps -p "$API_PID" -o %cpu --no-headers | tr -d ' ')
        local api_mem=$(ps -p "$API_PID" -o %mem --no-headers | tr -d ' ')
        local api_rss=$(ps -p "$API_PID" -o rss --no-headers | tr -d ' ')
        local api_vsz=$(ps -p "$API_PID" -o vsz --no-headers | tr -d ' ')

        # Converter para MB
        api_rss=$((api_rss / 1024))
        api_vsz=$((api_vsz / 1024))

        echo "$api_cpu $api_mem $api_rss $api_vsz"
    else
        echo "0 0 0 0"
    fi
}

# Função para obter conexões de rede
get_network_info() {
    # Conexões na porta 8080
    local connections_8080=$(netstat -an 2>/dev/null | grep ":8080" | grep "ESTABLISHED" | wc -l)
    local listening_8080=$(netstat -tulnp 2>/dev/null | grep ":8080" | grep "LISTEN" | wc -l)

    # Bytes de rede (interface principal)
    local interface=$(ip route | grep default | awk '{print $5}' | head -1)
    local rx_bytes=0
    local tx_bytes=0

    if [ -n "$interface" ] && [ -f "/sys/class/net/$interface/statistics/rx_bytes" ]; then
        rx_bytes=$(cat "/sys/class/net/$interface/statistics/rx_bytes")
        tx_bytes=$(cat "/sys/class/net/$interface/statistics/tx_bytes")
    fi

    echo "$connections_8080 $listening_8080 $rx_bytes $tx_bytes $interface"
}

# Função para obter informações do disco
get_disk_info() {
    local root_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    local db_size=$(du -sh /root/evolution-api-lite/prisma/dev.db 2>/dev/null | cut -f1 || echo "0")
    local logs_size=$(du -sh /var/log 2>/dev/null | cut -f1 || echo "0")

    echo "$root_usage $db_size $logs_size"
}

# Função para calcular throughput de rede
calculate_network_throughput() {
    local current_rx=$1
    local current_tx=$2
    local current_time=$3

    if [ $PREV_TIME -ne 0 ]; then
        local time_diff=$((current_time - PREV_TIME))
        local rx_diff=$((current_rx - PREV_RX_BYTES))
        local tx_diff=$((current_tx - PREV_TX_BYTES))

        if [ $time_diff -gt 0 ]; then
            local rx_rate=$((rx_diff / time_diff))
            local tx_rate=$((tx_diff / time_diff))

            # Converter para KB/s
            rx_rate=$((rx_rate / 1024))
            tx_rate=$((tx_rate / 1024))

            echo "$rx_rate $tx_rate"
        else
            echo "0 0"
        fi
    else
        echo "0 0"
    fi

    PREV_RX_BYTES=$current_rx
    PREV_TX_BYTES=$current_tx
    PREV_TIME=$current_time
}

# Função para desenhar barra de progresso
draw_progress_bar() {
    local percentage=$1
    local width=20
    local filled=$((percentage * width / 100))
    local empty=$((width - filled))

    printf "["
    printf "%${filled}s" | tr ' ' '█'
    printf "%${empty}s" | tr ' ' '░'
    printf "]"
}

# Função para colorir percentagem
color_percentage() {
    local percentage=$1
    if (( $(echo "$percentage < 50" | bc -l) )); then
        printf "${GREEN}%.1f%%${NC}" "$percentage"
    elif (( $(echo "$percentage < 80" | bc -l) )); then
        printf "${YELLOW}%.1f%%${NC}" "$percentage"
    else
        printf "${RED}%.1f%%${NC}" "$percentage"
    fi
}

# Função principal do dashboard
show_dashboard() {
    # Limpar tela
    clear

    # Header
    printf "${BOLD}${CYAN}"
    echo "📈 EVOLUTION API - DASHBOARD DE PERFORMANCE"
    echo "==========================================="
    printf "${NC}"
    printf "⏰ $(date '+%Y-%m-%d %H:%M:%S')    "
    printf "🔄 Atualização a cada ${UPDATE_INTERVAL}s    "
    printf "📍 Server: 195.35.17.156:8080\n\n"

    # Encontrar PID da API se necessário
    if [ -z "$API_PID" ] || ! kill -0 "$API_PID" 2>/dev/null; then
        find_api_pid
    fi

    # Obter métricas
    local cpu_total=$(get_cpu_usage)
    local mem_info=$(get_memory_info)
    local mem_percent=$(echo "$mem_info" | awk '{print $1}')
    local mem_used=$(echo "$mem_info" | awk '{print $2}')
    local mem_total=$(echo "$mem_info" | awk '{print $3}')

    local api_info=$(get_api_info)
    local api_cpu=$(echo "$api_info" | awk '{print $1}')
    local api_mem=$(echo "$api_info" | awk '{print $2}')
    local api_rss=$(echo "$api_info" | awk '{print $3}')
    local api_vsz=$(echo "$api_info" | awk '{print $4}')

    local network_info=$(get_network_info)
    local connections=$(echo "$network_info" | awk '{print $1}')
    local listening=$(echo "$network_info" | awk '{print $2}')
    local rx_bytes=$(echo "$network_info" | awk '{print $3}')
    local tx_bytes=$(echo "$network_info" | awk '{print $4}')
    local interface=$(echo "$network_info" | awk '{print $5}')

    local disk_info=$(get_disk_info)
    local disk_usage=$(echo "$disk_info" | awk '{print $1}')
    local db_size=$(echo "$disk_info" | awk '{print $2}')
    local logs_size=$(echo "$disk_info" | awk '{print $3}')

    # Calcular throughput
    local current_time=$(date +%s)
    local throughput=$(calculate_network_throughput "$rx_bytes" "$tx_bytes" "$current_time")
    local rx_rate=$(echo "$throughput" | awk '{print $1}')
    local tx_rate=$(echo "$throughput" | awk '{print $2}')

    # === SISTEMA ===
    printf "${BOLD}${BLUE}🖥️  SISTEMA${NC}\n"
    printf "CPU Total:  $(draw_progress_bar "$cpu_total") $(color_percentage "$cpu_total")\n"
    printf "RAM Usada:  $(draw_progress_bar "$mem_percent") $(color_percentage "$mem_percent") (${mem_used}MB/${mem_total}MB)\n"
    printf "Disco /:    $(draw_progress_bar "$disk_usage") $(color_percentage "$disk_usage")\n"
    echo ""

    # === EVOLUTION API ===
    printf "${BOLD}${GREEN}🚀 EVOLUTION API${NC}"
    if [ -n "$API_PID" ] && kill -0 "$API_PID" 2>/dev/null; then
        printf " (PID: $API_PID)\n"
        printf "CPU API:    $(draw_progress_bar "$api_cpu") ${api_cpu}%%\n"
        printf "RAM API:    $(draw_progress_bar "$api_mem") ${api_mem}%% (${api_rss}MB RSS / ${api_vsz}MB VSZ)\n"
    else
        printf " ${RED}[OFFLINE]${NC}\n"
        printf "Status:     ${RED}❌ Processo não encontrado${NC}\n"
    fi
    echo ""

    # === REDE ===
    printf "${BOLD}${PURPLE}🌐 REDE${NC}\n"
    printf "Porta 8080: "
    if [ "$listening" -gt 0 ]; then
        printf "${GREEN}✅ LISTEN${NC} | Conexões ativas: ${connections}\n"
    else
        printf "${RED}❌ NÃO ESCUTANDO${NC}\n"
    fi
    printf "Interface:  $interface\n"
    printf "Download:   ${rx_rate} KB/s\n"
    printf "Upload:     ${tx_rate} KB/s\n"
    echo ""

    # === STORAGE ===
    printf "${BOLD}${YELLOW}💾 STORAGE${NC}\n"
    printf "Database:   $db_size\n"
    printf "Logs:       $logs_size\n"
    echo ""

    # === STATUS RÁPIDO ===
    printf "${BOLD}${CYAN}⚡ STATUS RÁPIDO${NC}\n"

    # Status geral
    local status_color="${GREEN}"
    local status_text="✅ OPERACIONAL"

    if [ -z "$API_PID" ] || ! kill -0 "$API_PID" 2>/dev/null; then
        status_color="${RED}"
        status_text="❌ API OFFLINE"
    elif [ "$listening" -eq 0 ]; then
        status_color="${RED}"
        status_text="❌ PORTA FECHADA"
    elif (( $(echo "$cpu_total > 90" | bc -l) )); then
        status_color="${YELLOW}"
        status_text="⚠️  CPU ALTA"
    elif (( $(echo "$mem_percent > 90" | bc -l) )); then
        status_color="${YELLOW}"
        status_text="⚠️  RAM ALTA"
    fi

    printf "Status:     ${status_color}${status_text}${NC}\n"
    printf "Uptime:     $(uptime -p)\n"

    # Footer
    echo ""
    printf "${CYAN}Press Ctrl+C to exit${NC}\n"
}

# Trap para finalização
trap 'echo ""; echo "🏁 Dashboard finalizado."; exit 0' INT TERM

# Loop principal
echo "🎯 Iniciando dashboard de performance..."
sleep 2

while true; do
    show_dashboard
    sleep "$UPDATE_INTERVAL"
done