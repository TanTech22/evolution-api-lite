# 🧪 Plano de Teste e Monitoramento - Evolution API Constructor

## 📋 Objetivo

Este documento define estratégias abrangentes para testar e monitorar o Evolution API Constructor em produção, garantindo confiabilidade, performance e qualidade contínua do sistema.

---

## 🎯 Estratégia de Testes

### 1. **Testes de Queries Reais**

#### 🔍 **Cenários de Teste Prioritários**

##### **Categoria A: Endpoints Básicos**
```bash
# Queries que devem funcionar perfeitamente
./test_queries.py --category="basic" --queries='[
  "como criar uma instância",
  "enviar mensagem texto",
  "listar contatos",
  "status da instância",
  "deletar instância"
]'
```

##### **Categoria B: Filtros (Context Enhancement)**
```bash
# Queries que devem ativar enriquecimento de filtros
./test_queries.py --category="filters" --queries='[
  "filtros de áudio por duração",
  "configurar filtro de mensagem",
  "filtro por tipo de arquivo",
  "filtros de texto com padrão",
  "limitar tamanho de arquivo"
]'
```

##### **Categoria C: Webhooks (Context Enhancement)**
```bash
# Queries que devem ativar enriquecimento de webhooks
./test_queries.py --category="webhooks" --queries='[
  "webhook de monitoramento",
  "health check do webhook",
  "sistema dual webhook",
  "configurar callback URL",
  "retry de webhook"
]'
```

##### **Categoria D: Queries Complexas**
```bash
# Queries que testam capacidade de compreensão
./test_queries.py --category="complex" --queries='[
  "como configurar um bot que responde apenas comandos com prefixo",
  "webhook que recebe só mensagens de áudio filtradas",
  "instância com filtros de grupo e retry automático",
  "monitoramento de fila global com alertas"
]'
```

##### **Categoria E: Edge Cases**
```bash
# Queries que podem causar problemas
./test_queries.py --category="edge" --queries='[
  "asdfghjkl",
  "",
  "a",
  "como fazer um bolo de chocolate",
  "xpto endpoint inexistente"
]'
```

---

## 📊 Métricas de Sucesso

### **KPIs Principais**

| Métrica | Target | Crítico |
|---------|--------|---------|
| **Taxa de Sucesso** | ≥ 95% | ≥ 90% |
| **Tempo de Resposta Médio** | ≤ 2.0s | ≤ 3.0s |
| **Cache Hit Rate** | ≥ 80% | ≥ 60% |
| **Context Enhancement Rate** | ≥ 70% | ≥ 50% |
| **Error Recovery Rate** | ≥ 95% | ≥ 85% |
| **Performance Score** | ≥ 90 | ≥ 80 |

### **Métricas por Fase**

#### **Phase 1: Scoring**
- Candidatos encontrados: ≥ 2 para 95% das queries
- Score do primeiro candidato: ≥ 0.7 para 80% das queries
- Tempo de execução: ≤ 0.5s para 95% das queries

#### **Phase 2: IA Validation**
- Taxa de sucesso da IA: ≥ 98%
- Uso do sistema backup: ≤ 5%
- Tempo de execução: ≤ 1.5s para 90% das queries

#### **Phase 3: Context Enhancement**
- Detecção correta de contexto: ≥ 90%
- Tempo de enhancement: ≤ 0.8s para 95% das queries
- Qualidade do enriquecimento: Avaliação manual ≥ 8/10

---

## 🔄 Plano de Monitoramento Contínuo

### **1. Monitoramento em Tempo Real**

#### **Dashboard Principal**
- **URL**: `http://localhost:8080/dashboard.html`
- **Atualização**: A cada 30 segundos
- **Alertas**: Automáticos para degradação

#### **Métricas Monitoradas**
```javascript
{
  "system_health": {
    "status": "healthy|degraded|critical",
    "cpu_usage": "< 80%",
    "memory_usage": "< 70%",
    "uptime": "tracking"
  },
  "performance": {
    "total_searches": "counter",
    "success_rate": "> 95%",
    "avg_response_time": "< 2.0s",
    "performance_score": "> 90"
  },
  "cache": {
    "hit_rate": "> 80%",
    "memory_usage": "< 150MB",
    "entries": "tracking",
    "evictions": "< 1% per hour"
  },
  "errors": {
    "error_rate": "< 1%",
    "recovery_rate": "> 95%",
    "circuit_breakers": "all closed"
  }
}
```

### **2. Logs Estruturados**

#### **Localização dos Logs**
```bash
constructor/logs/
├── constructor_optimized.log    # Log principal
├── metrics_export_*.json        # Exportações de métricas
└── performance_report_*.json    # Relatórios de performance
```

#### **Análise de Logs**
```bash
# Análise diária de performance
python analyze_logs.py --date="2024-01-01" --report="daily"

# Detecção de anomalias
python detect_anomalies.py --window="24h" --threshold="2_std_dev"

# Trending de métricas
python trending_analysis.py --metric="response_time" --period="7d"
```

### **3. Health Checks Automáticos**

#### **Health Check Schedule**
```python
# A cada 5 minutos
health_check_basic = {
    "interval": "5m",
    "checks": [
        "system_resources",
        "cache_status",
        "error_rate",
        "response_time"
    ]
}

# A cada 30 minutos
health_check_extended = {
    "interval": "30m",
    "checks": [
        "performance_optimization",
        "cache_cleanup",
        "circuit_breaker_status",
        "trending_analysis"
    ]
}

# Diariamente
health_check_comprehensive = {
    "interval": "24h",
    "checks": [
        "full_system_report",
        "metrics_export",
        "log_analysis",
        "capacity_planning"
    ]
}
```

---

## 🚨 Sistema de Alertas

### **Níveis de Alerta**

#### **🟡 WARNING (Atenção)**
- Response time > 2.5s por mais de 5 minutos
- Cache hit rate < 70% por mais de 10 minutos
- Error rate entre 1-3% por mais de 5 minutos
- CPU usage > 80% por mais de 10 minutos

#### **🟠 DEGRADED (Degradado)**
- Response time > 3.0s por mais de 3 minutos
- Success rate < 95% por mais de 5 minutos
- Cache hit rate < 50% por mais de 5 minutos
- Memory usage > 85% por mais de 5 minutos

#### **🔴 CRITICAL (Crítico)**
- Response time > 5.0s por mais de 1 minuto
- Success rate < 90% por mais de 2 minutos
- System error rate > 5%
- Circuit breaker aberto
- Memory usage > 95%

### **Ações Automáticas**

```python
alert_actions = {
    "WARNING": [
        "log_detailed_metrics",
        "increase_monitoring_frequency"
    ],
    "DEGRADED": [
        "trigger_cache_optimization",
        "analyze_slow_queries",
        "prepare_fallback_systems"
    ],
    "CRITICAL": [
        "execute_emergency_cleanup",
        "activate_circuit_breakers",
        "send_admin_notification",
        "prepare_system_restart"
    ]
}
```

---

## 🧪 Rotina de Testes

### **Testes Diários (Automatizados)**

```bash
#!/bin/bash
# daily_test_routine.sh

echo "🚀 Iniciando testes diários..."

# 1. Teste básico de funcionamento
python test_basic_functionality.py

# 2. Teste de queries comuns
python test_common_queries.py --batch="daily_queries.json"

# 3. Teste de performance
python test_performance_benchmark.py --target="2s" --samples=100

# 4. Teste de cache
python test_cache_efficiency.py --duration="1h"

# 5. Health check completo
python health_check_comprehensive.py --export

echo "✅ Testes diários concluídos"
```

### **Testes Semanais (Semi-Automatizados)**

```bash
#!/bin/bash
# weekly_test_routine.sh

echo "📊 Iniciando testes semanais..."

# 1. Análise de trending
python trending_analysis.py --period="7d" --metrics="all"

# 2. Teste de stress
python stress_test.py --concurrent_users=50 --duration="30m"

# 3. Teste de recovery
python test_error_recovery.py --simulate_failures

# 4. Teste de contextual enhancement
python test_context_accuracy.py --manual_validation

# 5. Capacity planning
python capacity_analysis.py --project="30d"

echo "✅ Testes semanais concluídos"
```

### **Testes Mensais (Manuais)**

1. **Avaliação Qualitativa**
   - Review manual de 100 queries aleatórias
   - Avaliação da qualidade das respostas
   - Feedback de usuários reais

2. **Análise Competitiva**
   - Comparação com outras soluções
   - Benchmark de performance
   - Análise de novas funcionalidades

3. **Planejamento de Melhorias**
   - Identificação de gargalos
   - Priorização de otimizações
   - Planejamento de próximas features

---

## 📈 Relatórios e Análises

### **Relatório Diário**
```json
{
  "date": "2024-01-01",
  "summary": {
    "total_queries": 1247,
    "success_rate": 98.4,
    "avg_response_time": 1.2,
    "cache_hit_rate": 87.3,
    "context_activation_rate": 65.2
  },
  "top_queries": [...],
  "issues_detected": [...],
  "optimizations_applied": [...]
}
```

### **Relatório Semanal**
```json
{
  "week": "2024-W01",
  "trending": {
    "response_time": "improving",
    "cache_efficiency": "stable",
    "error_rate": "decreasing"
  },
  "capacity_analysis": {
    "current_load": "60%",
    "projected_growth": "15% per month",
    "capacity_until": "2024-06-01"
  }
}
```

### **Relatório Mensal**
```json
{
  "month": "2024-01",
  "performance_score": 92.5,
  "sla_compliance": 99.2,
  "cost_analysis": {...},
  "improvement_recommendations": [...],
  "roadmap_progress": {...}
}
```

---

## 🔧 Scripts de Teste

### **Script Principal de Teste**

```python
#!/usr/bin/env python3
"""
🧪 test_query_monitoring.py
Script principal para testes e monitoramento
"""

import json
import time
from constructor_optimized import optimized_constructor

def test_query_batch(queries, category="default"):
    """Testa um lote de queries"""
    results = []

    for query in queries:
        start_time = time.time()

        try:
            result = optimized_constructor(query)
            execution_time = time.time() - start_time

            success = "error" not in result
            has_enhancement = "enhanced_documentation" in result

            results.append({
                "query": query,
                "success": success,
                "execution_time": execution_time,
                "has_enhancement": has_enhancement,
                "final_score": result.get("final_score", 0)
            })

        except Exception as e:
            results.append({
                "query": query,
                "success": False,
                "error": str(e),
                "execution_time": time.time() - start_time
            })

    return analyze_results(results, category)

def analyze_results(results, category):
    """Analisa resultados dos testes"""
    total = len(results)
    successful = len([r for r in results if r["success"]])

    avg_time = sum(r["execution_time"] for r in results) / total
    enhancement_rate = len([r for r in results if r.get("has_enhancement", False)]) / total

    return {
        "category": category,
        "total_queries": total,
        "success_rate": successful / total,
        "avg_response_time": avg_time,
        "enhancement_rate": enhancement_rate,
        "results": results
    }

if __name__ == "__main__":
    # Executa testes por categoria
    categories = {
        "basic": [
            "como criar uma instância",
            "enviar mensagem",
            "listar contatos"
        ],
        "filters": [
            "filtros de áudio",
            "configurar filtro de mensagem"
        ],
        "webhooks": [
            "webhook de monitoramento",
            "sistema dual webhook"
        ]
    }

    for category, queries in categories.items():
        print(f"\n🧪 Testando categoria: {category}")
        results = test_query_batch(queries, category)
        print(f"✅ Success Rate: {results['success_rate']:.1%}")
        print(f"⏱️ Avg Time: {results['avg_response_time']:.2f}s")
```

---

## 🎯 Conclusão

Este plano de teste e monitoramento garante:

✅ **Qualidade Contínua**: Testes automatizados diários
✅ **Monitoramento 24/7**: Dashboard e alertas em tempo real
✅ **Performance Tracking**: Métricas detalhadas e trending
✅ **Detecção Precoce**: Alertas automáticos para problemas
✅ **Otimização Contínua**: Análises e melhorias regulares

**Resultado**: Sistema confiável, performático e sempre otimizado para produção! 🚀

---

## 🎯 Plano de Teste Manual Sistemático

### **Objetivo**
Executar testes manuais sistemáticos do Evolution API Constructor utilizando uma lista abrangente de prompts para validar todas as funcionalidades e identificar padrões de sucesso/falha.

### **Metodologia**

#### **Fase 1: Preparação dos Testes**
✅ **Documentos de Referência:**
- `teste-query-prompts.md`: Lista de 120 prompts categorizados
- `teste-queries-response.md`: Arquivo para coleta de resultados

#### **Fase 2: Execução dos Testes**
📋 **Processo:**
1. Executar cada prompt da lista sequencialmente
2. Registrar métricas para cada teste:
   - Tempo de resposta
   - Context enhancement (Sim/Não)
   - Final score
3. Registrar resultado:
   - Resposta completa (se sucesso)
   - "ERRO" (se falha)

#### **Fase 3: Análise dos Resultados**
📊 **Análises Planejadas:**
- Taxa de sucesso por categoria
- Identificação de padrões de falha
- Performance por tipo de query
- Eficácia do context enhancement
- Mapeamento de gaps funcionais

### **Cobertura de Testes**

| Categoria | Prompts | Objetivo |
|-----------|---------|----------|
| **Básicos** | 25 | Validar endpoints fundamentais |
| **Filtros** | 15 | Testar context enhancement de filtros |
| **Webhooks** | 20 | Testar context enhancement de webhooks |
| **Complexas** | 15 | Validar cenários avançados |
| **Integrações** | 15 | Testar recursos avançados |
| **Edge Cases** | 15 | Validar robustez do sistema |
| **Troubleshooting** | 10 | Testar resolução de problemas |
| **Outros** | 5 | Casos diversos |

### **Métricas de Sucesso Esperadas**
- **Taxa de Sucesso Geral**: ≥ 85%
- **Context Enhancement Rate**: ≥ 60%
- **Tempo Médio de Resposta**: ≤ 2.5s
- **Taxa de Sucesso por Categoria**:
  - Básicos: ≥ 95%
  - Filtros: ≥ 80%
  - Webhooks: ≥ 80%
  - Complexas: ≥ 70%
  - Edge Cases: ≤ 30% (esperado)

### **Entregáveis**
1. ✅ **Lista de Prompts**: `teste-query-prompts.md`
2. ✅ **Resultados Consolidados**: `teste-queries-response.md`
3. 🔄 **Relatório de Análise**: A ser gerado após coleta
4. 🔄 **Plano de Melhorias**: Baseado nos resultados

### **Cronograma**
- **Preparação**: ✅ Concluída
- **Execução**: 🔄 Em andamento
- **Análise**: ⏳ Aguardando conclusão da execução
- **Melhorias**: ⏳ Aguardando análise

Este plano complementa o monitoramento automatizado com validação manual sistemática, garantindo cobertura completa e qualidade do sistema constructor! 🧪