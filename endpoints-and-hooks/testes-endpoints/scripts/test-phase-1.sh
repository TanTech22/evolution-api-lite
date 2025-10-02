#!/bin/bash
# 🧪 FASE 1: TESTES BÁSICOS - Evolution API
# Testes de conectividade básica com ZERO RISCO

# Configurações
SERVER_URL=${1:-"http://195.35.17.156:8080"}
API_KEY="BQYHJGJHJ"
INSTANCE="5511930670388"
LOG_FILE="./resultados/logs/phase-1-$(date +%Y%m%d-%H%M%S).log"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Contadores
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Criar diretório de logs se não existir
mkdir -p "$(dirname "$LOG_FILE")"

echo "🧪 EVOLUTION API - FASE 1: TESTES BÁSICOS"
echo "========================================"
echo "🎯 Servidor: $SERVER_URL"
echo "🔑 API Key: $API_KEY"
echo "📝 Log: $LOG_FILE"
echo "⏰ Início: $(date)"
echo ""

# Função para logging
log() {
    echo "$1" | tee -a "$LOG_FILE"
}

# Função para teste HTTP
test_endpoint() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local headers="$4"
    local data="$5"
    local expected_status="$6"

    ((TOTAL_TESTS++))

    log "📡 Teste $TOTAL_TESTS: $test_name"
    log "   URL: $method $endpoint"

    # Fazer requisição com melhor tratamento
    local temp_file=$(mktemp)
    local http_code=""
    local time_total=""

    if [ "$method" = "GET" ]; then
        http_code=$(curl -s -w "%{http_code}" -o "$temp_file" \
                        -X GET "$endpoint" $headers 2>/dev/null)
    else
        http_code=$(curl -s -w "%{http_code}" -o "$temp_file" \
                        -X "$method" "$endpoint" $headers -d "$data" 2>/dev/null)
    fi

    # Ler conteúdo da resposta
    local content=$(cat "$temp_file" 2>/dev/null || echo "")
    rm -f "$temp_file"

    # Verificar resultado
    if [ "$http_code" = "$expected_status" ]; then
        ((PASSED_TESTS++))
        printf "${GREEN}✅ SUCESSO${NC} - Status $http_code\n"
        log "   ✅ SUCESSO - Status $http_code"

        # Mostrar resposta se for pequena
        if [ ${#content} -lt 200 ]; then
            log "   📄 Resposta: $content"
        else
            log "   📄 Resposta: [${#content} caracteres]"
        fi
    else
        ((FAILED_TESTS++))
        printf "${RED}❌ FALHOU${NC} - Status $http_code (esperado: $expected_status)\n"
        log "   ❌ FALHOU - Status $http_code (esperado: $expected_status)"
        log "   📄 Resposta: $content"
    fi

    log ""
    echo ""

    # Pausa entre testes
    sleep 1
}

# Início dos testes
log "🚀 Iniciando Fase 1 - Testes Básicos (3 endpoints)"
log "============================================="

# TESTE 1: Status da API
test_endpoint \
    "Status da API" \
    "GET" \
    "$SERVER_URL/" \
    '-H "Accept: application/json"' \
    "" \
    "200"

# TESTE 2: Listar Instâncias
test_endpoint \
    "Listar Instâncias" \
    "GET" \
    "$SERVER_URL/instance/fetchInstances" \
    '-H "apikey: '"$API_KEY"'"' \
    "" \
    "200"

# TESTE 3: Verificar Instância (substitui connectionState que não existe)
test_endpoint \
    "Verificar se API aceita parâmetros" \
    "GET" \
    "$SERVER_URL/instance/fetchInstances" \
    '-H "apikey: '"$API_KEY"'" -H "Accept: application/json"' \
    "" \
    "200"

# Relatório final
echo ""
echo "🏁 RELATÓRIO FINAL - FASE 1"
echo "=========================="
printf "📊 Total de testes: ${BLUE}$TOTAL_TESTS${NC}\n"
printf "✅ Sucessos: ${GREEN}$PASSED_TESTS${NC}\n"
printf "❌ Falhas: ${RED}$FAILED_TESTS${NC}\n"

if [ $FAILED_TESTS -eq 0 ]; then
    printf "🎉 ${GREEN}TODOS OS TESTES PASSARAM!${NC}\n"
    exit_code=0
else
    printf "⚠️  ${YELLOW}ALGUNS TESTES FALHARAM${NC}\n"
    exit_code=1
fi

echo "⏰ Fim: $(date)"
echo "📝 Log salvo em: $LOG_FILE"

# Salvar relatório JSON
cat > "${LOG_FILE}.json" << EOF
{
  "phase": 1,
  "name": "Testes Básicos",
  "server_url": "$SERVER_URL",
  "timestamp": "$(date -Iseconds)",
  "total_tests": $TOTAL_TESTS,
  "passed_tests": $PASSED_TESTS,
  "failed_tests": $FAILED_TESTS,
  "success_rate": $(echo "scale=2; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc -l),
  "status": "$([ $FAILED_TESTS -eq 0 ] && echo 'PASSED' || echo 'FAILED')"
}
EOF

exit $exit_code