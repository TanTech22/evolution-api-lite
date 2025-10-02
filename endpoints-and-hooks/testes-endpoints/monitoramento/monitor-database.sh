#!/bin/bash
# 🗄️ Monitor de Database - Evolution API
# Monitora atividade do SQLite e queries do Prisma

echo "🗄️ INICIANDO MONITORAMENTO DO BANCO DE DADOS"
echo "============================================"
echo "⏰ $(date)"
echo "📍 Database: /root/evolution-api-lite/prisma/dev.db"
echo "🎯 Monitorando: Queries, Locks, Performance, Contadores"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Variáveis
DB_PATH="/root/evolution-api-lite/prisma/dev.db"
PREV_INSTANCES=0
PREV_MESSAGES=0
PREV_CHATS=0
PREV_CONTACTS=0

# Verificar se database existe
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database não encontrado em: $DB_PATH"
    exit 1
fi

echo "✅ Database encontrado: $(du -h "$DB_PATH" | cut -f1)"

# Função para executar query SQLite com timeout
safe_query() {
    local query="$1"
    timeout 3 sqlite3 "$DB_PATH" "$query" 2>/dev/null || echo "TIMEOUT"
}

# Função para mostrar estatísticas das tabelas
show_table_stats() {
    local timestamp=$(date "+%H:%M:%S")

    # Contadores atuais
    local instances=$(safe_query "SELECT COUNT(*) FROM Instance;")
    local messages=$(safe_query "SELECT COUNT(*) FROM Message;")
    local chats=$(safe_query "SELECT COUNT(*) FROM Chat;")
    local contacts=$(safe_query "SELECT COUNT(*) FROM Contact;")
    local webhooks=$(safe_query "SELECT COUNT(*) FROM Webhook;")

    # Verificar se houve mudanças
    local instances_diff=$((instances - PREV_INSTANCES))
    local messages_diff=$((messages - PREV_MESSAGES))
    local chats_diff=$((chats - PREV_CHATS))
    local contacts_diff=$((contacts - PREV_CONTACTS))

    printf "${CYAN}📊 [$timestamp] CONTADORES:${NC}\n"
    printf "   📱 Instâncias: ${BLUE}$instances${NC}"
    [ $instances_diff -ne 0 ] && printf " ${YELLOW}(${instances_diff:+"+"}$instances_diff)${NC}"
    echo ""

    printf "   💬 Mensagens: ${GREEN}$messages${NC}"
    [ $messages_diff -ne 0 ] && printf " ${YELLOW}(${messages_diff:+"+"}$messages_diff)${NC}"
    echo ""

    printf "   💭 Chats: ${PURPLE}$chats${NC}"
    [ $chats_diff -ne 0 ] && printf " ${YELLOW}(${chats_diff:+"+"}$chats_diff)${NC}"
    echo ""

    printf "   👥 Contatos: ${CYAN}$contacts${NC}"
    [ $contacts_diff -ne 0 ] && printf " ${YELLOW}(${contacts_diff:+"+"}$contacts_diff)${NC}"
    echo ""

    printf "   🔗 Webhooks: ${BLUE}$webhooks${NC}\n"

    # Atualizar valores anteriores
    PREV_INSTANCES=$instances
    PREV_MESSAGES=$messages
    PREV_CHATS=$chats
    PREV_CONTACTS=$contacts
}

# Função para mostrar atividade de locks
check_database_locks() {
    local timestamp=$(date "+%H:%M:%S")

    # Verificar processos usando o database
    local db_users=$(lsof "$DB_PATH" 2>/dev/null | grep -v "COMMAND" | wc -l)

    if [ $db_users -gt 0 ]; then
        printf "${YELLOW}🔒 [$timestamp] Database em uso por $db_users processo(s)${NC}\n"

        # Mostrar processos específicos
        lsof "$DB_PATH" 2>/dev/null | grep -v "COMMAND" | while read -r line; do
            local cmd=$(echo "$line" | awk '{print $1}')
            local pid=$(echo "$line" | awk '{print $2}')
            printf "   └─ ${cmd} (PID: ${pid})\n"
        done
    fi
}

# Função para mostrar performance do database
show_database_performance() {
    local timestamp=$(date "+%H:%M:%S")
    local db_size=$(du -h "$DB_PATH" | cut -f1)

    printf "${BLUE}⚡ [$timestamp] PERFORMANCE:${NC}\n"
    printf "   📦 Tamanho: $db_size\n"

    # Teste de performance simples
    local start_time=$(date +%s.%N)
    safe_query "SELECT 1;" > /dev/null
    local end_time=$(date +%s.%N)
    local query_time=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "0")

    printf "   ⏱️  Query simples: ${query_time}s\n"

    # WAL mode status
    local wal_mode=$(safe_query "PRAGMA journal_mode;")
    printf "   📝 Journal mode: $wal_mode\n"
}

# Função para mostrar últimas atividades
show_recent_activity() {
    local timestamp=$(date "+%H:%M:%S")

    printf "${GREEN}📋 [$timestamp] ATIVIDADE RECENTE:${NC}\n"

    # Últimas instâncias (se houver)
    local recent_instances=$(safe_query "SELECT name, connectionStatus, integration FROM Instance ORDER BY id DESC LIMIT 3;")
    if [ "$recent_instances" != "TIMEOUT" ] && [ -n "$recent_instances" ]; then
        printf "   📱 Últimas instâncias:\n"
        echo "$recent_instances" | while IFS='|' read -r name status integration; do
            printf "      └─ $name ($status) [$integration]\n"
        done
    fi

    # Últimas mensagens (se houver)
    local recent_messages=$(safe_query "SELECT COUNT(*) FROM Message WHERE datetime(createdAt) > datetime('now', '-1 minute');")
    if [ "$recent_messages" != "TIMEOUT" ] && [ "$recent_messages" -gt 0 ]; then
        printf "   💬 Mensagens no último minuto: $recent_messages\n"
    fi
}

# Função para verificar integridade
check_database_integrity() {
    local integrity_check=$(timeout 10 sqlite3 "$DB_PATH" "PRAGMA integrity_check;" 2>/dev/null)

    if [ "$integrity_check" = "ok" ]; then
        printf "${GREEN}✅ Database íntegro${NC}\n"
    elif [ -n "$integrity_check" ]; then
        printf "${RED}❌ Problemas de integridade: $integrity_check${NC}\n"
    fi
}

# Inicializar contadores
show_table_stats > /dev/null 2>&1

echo "🎯 Monitoramento ativo. Pressione Ctrl+C para parar."
echo "----------------------------------------"

# Trap para finalização
trap 'echo ""; echo "🏁 Monitoramento de database finalizado."; exit 0' INT TERM

# Loop principal
counter=0
while true; do
    ((counter++))

    # A cada ciclo: mostrar contadores
    show_table_stats

    # A cada 5 ciclos (25s): verificar locks e performance
    if [ $((counter % 5)) -eq 0 ]; then
        echo ""
        check_database_locks
        show_database_performance
    fi

    # A cada 12 ciclos (1 minuto): atividade recente
    if [ $((counter % 12)) -eq 0 ]; then
        echo ""
        show_recent_activity
    fi

    # A cada 60 ciclos (5 minutos): verificar integridade
    if [ $((counter % 60)) -eq 0 ]; then
        echo ""
        check_database_integrity
    fi

    echo ""
    sleep 5
done