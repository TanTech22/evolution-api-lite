#!/bin/bash

# Script de Monitoramento de Memória - Evolution API
# Uso: ./monitor-memory.sh [segundos_intervalo] [duração_total]

INTERVAL=${1:-10}  # Intervalo padrão: 10 segundos
DURATION=${2:-300} # Duração padrão: 5 minutos
LOG_FILE="memory-monitor-$(date +%Y%m%d_%H%M%S).log"

echo "=== EVOLUTION API MEMORY MONITOR ===" | tee $LOG_FILE
echo "Intervalo: ${INTERVAL}s | Duração: ${DURATION}s" | tee -a $LOG_FILE
echo "Log: $LOG_FILE" | tee -a $LOG_FILE
echo "================================================" | tee -a $LOG_FILE

# Função para obter informações do sistema
get_system_info() {
    echo "--- $(date) ---" >> $LOG_FILE

    # Memória total do sistema
    TOTAL_MEM=$(free -m | awk 'NR==2{printf "Total: %sMB, Used: %sMB (%.2f%%), Free: %sMB", $2,$3,$3*100/$2,$4}')
    echo "Sistema: $TOTAL_MEM" >> $LOG_FILE

    # Buscar processos Evolution API
    EVOLUTION_PIDS=$(pgrep -f "evolution.*main.ts|main.ts.*evolution" | tr '\n' ' ')

    if [ -n "$EVOLUTION_PIDS" ]; then
        echo "Evolution PIDs: $EVOLUTION_PIDS" >> $LOG_FILE

        TOTAL_RSS=0
        TOTAL_VSZ=0
        INSTANCE_COUNT=0

        for pid in $EVOLUTION_PIDS; do
            if ps -p $pid > /dev/null 2>&1; then
                PROC_INFO=$(ps -o pid,rss,vsz,pmem,pcpu,command -p $pid --no-headers)
                echo "  PID $pid: $PROC_INFO" >> $LOG_FILE

                RSS=$(echo $PROC_INFO | awk '{print $2}')
                VSZ=$(echo $PROC_INFO | awk '{print $3}')

                TOTAL_RSS=$((TOTAL_RSS + RSS))
                TOTAL_VSZ=$((TOTAL_VSZ + VSZ))
            fi
        done

        # Buscar número de instâncias conectadas
        INSTANCE_COUNT=$(curl -s "http://localhost:8080/instance/fetchInstances" 2>/dev/null | grep -o '"connectionStatus":"open"' | wc -l)

        RSS_MB=$((TOTAL_RSS / 1024))
        VSZ_MB=$((TOTAL_VSZ / 1024))

        echo "Instâncias conectadas: $INSTANCE_COUNT" >> $LOG_FILE
        echo "Total Evolution: RSS=${RSS_MB}MB, VSZ=${VSZ_MB}MB" >> $LOG_FILE

        if [ $INSTANCE_COUNT -gt 0 ]; then
            RSS_PER_INSTANCE=$((RSS_MB / INSTANCE_COUNT))
            echo "Memória por instância: ~${RSS_PER_INSTANCE}MB" >> $LOG_FILE
        fi
    else
        echo "Evolution API não encontrado" >> $LOG_FILE
    fi

    echo "" >> $LOG_FILE
}

# Função para calcular estatísticas
calculate_stats() {
    echo "=== RELATÓRIO FINAL ===" >> $LOG_FILE
    echo "Análise baseada no log: $LOG_FILE" >> $LOG_FILE

    # Extrair valores de memória por instância
    grep "Memória por instância" $LOG_FILE | awk '{print $4}' | sed 's/~//;s/MB//' > /tmp/memory_per_instance.txt

    if [ -s /tmp/memory_per_instance.txt ]; then
        MIN_MEM=$(sort -n /tmp/memory_per_instance.txt | head -1)
        MAX_MEM=$(sort -n /tmp/memory_per_instance.txt | tail -1)
        AVG_MEM=$(awk '{sum+=$1} END {printf "%.0f", sum/NR}' /tmp/memory_per_instance.txt)

        echo "Consumo de memória por instância:" >> $LOG_FILE
        echo "  Mínimo: ${MIN_MEM}MB" >> $LOG_FILE
        echo "  Máximo: ${MAX_MEM}MB" >> $LOG_FILE
        echo "  Média: ${AVG_MEM}MB" >> $LOG_FILE

        # Calcular capacidade
        TOTAL_SYSTEM_MB=$(free -m | awk 'NR==2{print $2}')
        AVAILABLE_MB=$(free -m | awk 'NR==2{print $7}')

        # Deixar 2GB de margem de segurança
        USABLE_MB=$((AVAILABLE_MB - 2048))

        MAX_INSTANCES_MIN=$((USABLE_MB / MAX_MEM))
        MAX_INSTANCES_AVG=$((USABLE_MB / AVG_MEM))

        echo "" >> $LOG_FILE
        echo "Estimativa de capacidade máxima:" >> $LOG_FILE
        echo "  Memória total sistema: ${TOTAL_SYSTEM_MB}MB" >> $LOG_FILE
        echo "  Memória disponível: ${AVAILABLE_MB}MB" >> $LOG_FILE
        echo "  Memória utilizável (margem 2GB): ${USABLE_MB}MB" >> $LOG_FILE
        echo "  Máx instâncias (pior caso): $MAX_INSTANCES_MIN" >> $LOG_FILE
        echo "  Máx instâncias (média): $MAX_INSTANCES_AVG" >> $LOG_FILE

        rm -f /tmp/memory_per_instance.txt
    fi

    echo "=== FIM DO RELATÓRIO ===" >> $LOG_FILE
}

# Trap para executar cálculos ao final
trap calculate_stats EXIT

# Loop principal
END_TIME=$(($(date +%s) + DURATION))
while [ $(date +%s) -lt $END_TIME ]; do
    get_system_info
    sleep $INTERVAL
done

echo "Monitoramento concluído. Relatório salvo em: $LOG_FILE"