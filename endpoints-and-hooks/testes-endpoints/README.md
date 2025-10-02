# 🧪 **Sistema de Testes Distribuídos - Evolution API**

Este diretório contém a implementação completa do sistema de testes distribuídos para a Evolution API, permitindo execução remota de testes com monitoramento em tempo real.

## 📁 **Estrutura do Projeto**

```
testes-endpoints/
├── README.md                 # Este arquivo
├── plano-de-acao.md         # Estratégia e planejamento detalhado
|–– plano-de-teste-endpoints.md # Detalhamento com as chamadas
├── scripts/                 # Scripts de teste para executar da máquina local
│   ├── test-phase-1.sh      # Testes básicos (0 risco)
│   ├── test-phase-2.sh      # Endpoints nativos
│   ├── test-phase-3.sh      # Endpoints custom
│   └── test-all.sh          # Execução completa
├── monitoramento/           # Scripts de monitoramento do servidor
│   ├── monitor-api-logs.sh  # Logs detalhados da API
│   ├── monitor-webhooks.sh  # Webhooks e callbacks
│   ├── monitor-database.sh  # Atividade do banco
│   └── monitor-performance.sh # Métricas de performance
├── resultados/             # Relatórios e logs dos testes
│   ├── logs/               # Logs por data/execução
│   └── reports/            # Relatórios consolidados
└── configs/                # Configurações e templates
    ├── webhook-urls.json   # URLs de webhooks de teste
    └── test-config.json    # Configurações dos testes
```

## 🎯 **Objetivos**

1. **Teste Remoto**: Executar testes da máquina local para servidor remoto
2. **Monitoramento Real-time**: Observar impacto no servidor durante os testes
3. **Validação Completa**: Cobrir 100% dos endpoints (108 + 2 webhooks)
4. **Análise de Performance**: Medir impacto e otimizações

## 🧪 **Configuração de Teste**

- **Servidor**: http://195.35.17.156:8080
- **API Key**: `BQYHJGJHJ`
- **Instância de teste**: `5511930670388`

## 🚀 **Quick Start**

### **No Servidor (195.35.17.156):**
```bash
# Terminal 1: Monitoramento completo
cd /root/evolution-api-lite/endpoints-and-hooks/testes-endpoints
./monitoramento/monitor-api-logs.sh

# Terminal 2: Monitoramento de webhooks (opcional)
./monitoramento/monitor-webhooks.sh
```

### **Na Sua Máquina Local:**
```bash
# Baixar scripts de teste
wget http://195.35.17.156:8080/scripts/test-phase-1.sh
chmod +x test-phase-1.sh

# Executar testes básicos
./test-phase-1.sh 195.35.17.156:8080
```

## 📊 **Fases de Implementação**

### **✅ Fase 1: Logs Detalhados da API**
- Monitoramento de requisições em tempo real
- Análise de performance por endpoint
- Detecção de erros e timeouts

### **🔄 Fase 2: Webhooks e Callbacks**
- Captura de webhooks enviados
- Validação de payloads
- Monitoramento de retry/falhas

### **📈 Fase 3: Atividade do Banco de Dados**
- Monitoramento de queries Prisma
- Análise de performance de consultas
- Detecção de locks/deadlocks

### **🎯 Fase 4: Métricas de Performance**
- CPU, memória, rede
- Tempo de resposta por endpoint
- Dashboard em tempo real

## 🔧 **Configuração**

Veja o arquivo `plano-de-acao.md` para instruções detalhadas de configuração e execução.

## 📝 **Status Atual**

- ✅ Estrutura criada
- 🔄 Implementando Fase 1 (Logs API)
- ⏳ Pendente: Fases 2, 3, 4

---
**Criado em**: 2025-10-02
**Última atualização**: Em desenvolvimento
**Servidor de teste**: http://195.35.17.156:8080