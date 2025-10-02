# 🤖 Evolution API Constructor - Implementation Plan

## 📋 **Estratégia de Desenvolvimento Detalhada**

### 🎯 **Objetivo**
Criar um agente constructor/consultor infalível para Evolution API que utiliza estratégia híbrida de busca (IA + textual) com economia de recursos computacionais e alta precisão.

---

## 🏗️ **Arquitetura do Sistema**

### **Core Components**

1. **📁 Estrutura de Dados**
   ```
   endpoints-and-hooks/
   ├── config/ai_config.json           # Configurações IA (Anthropic Sonnet 4)
   ├── consolidated-map.json           # Índice consolidado (81 endpoints/webhooks)
   ├── custom/
   │   ├── map.json                    # Localizações customizadas
   │   └── description.md              # Documentação detalhada
   └── evolution-native/
       ├── map.json                    # Localizações nativas
       └── description.md              # Documentação Evolution
   ```

2. **🤖 Agente Principal**
   ```python
   class EvolutionAPIConstructor:
       - __init__()              # Carrega config + índice consolidado
       - search_api()            # Função principal de busca
       - _phase1_weighted_scoring()  # Scoring ponderado textual
       - _extract_detailed_info_with_ai_validation()  # IA validation
   ```

---

## 🔄 **Fluxo de Processamento Completo**

### **FASE 1: Scoring Ponderado Textual (Eliminação Inteligente)**

#### **Entrada**: Query do usuário + todos os endpoints (81 itens)

#### **Processamento**:
1. **Análise Textual Multi-Dimensional**:
   - **Nome do endpoint** (peso 40%)
   - **Resumo/descrição** (peso 35%)
   - **Keywords** (peso 25%)

2. **Algoritmos de Similaridade**:
   - Exact match (score 1.0)
   - Word intersection (proporcional)
   - Substring matching (70% do score)

3. **Scoring Matemático**:
   ```python
   weighted_score = (
       name_score * 0.4 +
       summary_score * 0.35 +
       keywords_score * 0.25
   )
   ```

4. **Threshold Filtering**: Mínimo 0.3 de score

#### **Saída**: TOP 2 candidatos mais prováveis

---

### **FASE 2: IA Validation + Backup Strategy**

#### **Entrada**: TOP 2 candidatos da Fase 1

#### **Processamento**:

1. **Extração Cirúrgica do Primeiro Candidato**:
   - Localiza no map.json específico (custom/evolution-native)
   - Extrai linhas exatas do description.md (startLine → endLine)
   - Adiciona contexto (±2 linhas)

2. **IA Analysis (Anthropic Sonnet 4)**:
   - Prompt especializado em Evolution API
   - Conhecimento prévio de endpoints nativos/customizados
   - Validação rigorosa do match
   - Estruturação JSON super detalhada

3. **Backup Decision Logic**:
   ```python
   if ai_score < textual_score * 0.7:  # 30% degradação
       test_backup_candidate()
       compare_results()
       return_best_match()
   ```

4. **Estruturação Base**:
   - JSON completo com todos os campos
   - Query parameters documentados
   - Headers, authentication, examples
   - Variáveis marcadas para substituição ({VARIABLE})

#### **Saída**: JSON estruturado base

---

### **🌶️ FASE 3: Enriquecimento Contextual (NOVO)**

#### **Entrada**: JSON estruturado + endpoint selecionado

#### **Processamento**:

1. **Detecção Contextual Pós-Seleção**:
   ```python
   # Baseado no ENDPOINT selecionado, não na query
   if endpoint_about_filters():
       context_files.append("filters.md")
   if endpoint_about_webhooks():
       context_files.append("dual-webhook-system.md")
   ```

2. **Triggers de Enriquecimento**:
   - **Filtros**: Palavras-chave em endpoint/categoria → `filters.md`
   - **Webhooks**: Palavras-chave em endpoint/categoria → `dual-webhook-system.md`

3. **Extração de Contexto Especializado**:
   - Carrega arquivo de suporte completo
   - IA extrai seções relevantes ao endpoint
   - Processa exemplos práticos e troubleshooting
   - Identifica cenários de uso específicos

4. **Enriquecimento da Resposta**:
   ```python
   enhanced_response = {
       ...base_response,  # JSON original
       "enhanced_documentation": {
           "source_file": "filters.md",
           "practical_scenarios": [...],
           "important_notes": [...],
           "troubleshooting": {...},
           "related_endpoints": [...]
       }
   }
   ```

#### **Saída**: JSON estruturado completo + contexto enriquecido

---

## 📊 **Estrutura de Dados Otimizada**

### **1. Índice Consolidado (consolidated-map.json)**
```json
{
  "metadata": {
    "total_entries": 81,
    "sources": ["evolution-native", "custom"]
  },
  "endpoints": [
    {
      "id": "create_instance",
      "source": "custom",
      "category": "Instance Management",
      "name": "Criar Instância",
      "summary": "Cria nova instância WhatsApp...",
      "keywords": ["instancia", "criar", "filtros"]
    }
  ]
}
```

### **2. Maps de Localização (map.json)**
```json
{
  "Instance Management - Basic": {
    "endpoints": [
      {
        "name": "Criar Instância",
        "location": {
          "request": {"startLine": 58, "endLine": 87},
          "response": {"startLine": 89, "endLine": 115}
        }
      }
    ]
  }
}
```

### **3. JSON de Resposta Final Enriquecido**
```json
{
  "endpoint": {
    "method": "POST",
    "path": "/instance/create",
    "name": "Criar Instância",
    "category": "Instance Management - Basic"
  },
  "authentication": {"required": true, "type": "header", "key": "apikey"},
  "headers": {"required": ["Content-Type", "apikey"]},
  "path_parameters": {"instanceName": {...}},
  "query_parameters": {"limit": {...}},
  "request_body": {"required": true, "schema": {...}},
  "responses": {"200": {...}, "400": {...}},
  "examples": [...],

  // 🌶️ SEÇÃO DE ENRIQUECIMENTO (opcional)
  "enhanced_documentation": {
    "source_file": "filters.md",
    "practical_scenarios": [
      {
        "title": "Bot de Comandos (Apenas Texto com Prefixo)",
        "config": {
          "messageTypes": ["conversation"],
          "textFilters": {"allowedPatterns": ["^[!/]"]}
        },
        "behavior": "Aceita: /help, !status | Rejeita: oi tudo bem"
      }
    ],
    "important_notes": [
      "Limite de 24MB é global e fixo para áudios",
      "Feedback de duração configurável via replyToOversizeAudio",
      "Filtros aplicados ANTES da persistência - zero armazenamento"
    ],
    "troubleshooting": {
      "common_errors": ["Invalid message types", "Instance not found"],
      "solutions": ["Verificar tipos válidos na documentação", "Confirmar instanceName"]
    },
    "related_endpoints": [
      "/instance/{instanceName}/filters - Consultar filtros atuais",
      "/instance/{instanceName}/filters/audio - Filtros específicos de áudio"
    ]
  },

  "final_score": 0.95,
  "confidence": 0.90
}
```

---

## ⚡ **Estratégias de Otimização**

### **1. Economia de Recursos Computacionais**
- **Carregamento Único**: consolidated-map.json carregado 1x na inicialização
- **Extração Cirúrgica**: Apenas linhas específicas, não arquivos completos
- **Cache Inteligente**: Resultados de buscas recentes (TTL configurável)
- **Lazy Loading**: description.md carregado apenas quando necessário
- **🌶️ Enriquecimento Seletivo**: Arquivos de suporte carregados apenas quando endpoint requer

### **2. Performance Targeting**
- **< 2s** tempo de resposta médio
- **99.9%** acerto no primeiro candidato
- **< 1%** uso do sistema de backup
- **95%+** precisão geral

### **3. Configurabilidade**
```json
{
  "scoring": {
    "name_weight": 0.4,
    "summary_weight": 0.35,
    "keywords_weight": 0.25,
    "minimum_threshold": 0.3
  },
  "cache_enabled": true,
  "cache_ttl_seconds": 3600
}
```

---

## 🛠️ **Implementação Técnica**

### **1. Stack Tecnológico**
- **Python 3.8+**
- **Anthropic Claude SDK** (Sonnet 4)
- **JSON processing** nativo
- **Regex** para text matching
- **Dataclasses** para type safety

### **2. Dependencies**
```
anthropic>=0.7.0
requests>=2.31.0
python-dotenv>=1.0.0
dataclasses-json>=0.6.0
typing-extensions>=4.8.0
```

### **3. API Interface**
```python
from constructor import constructor

# Busca simples
result = constructor("como criar uma instância")

# Busca avançada
result = constructor("webhook de monitoramento com filtros")

# Busca técnica
result = constructor("rate limiting da fila global")
```

---

## 🎯 **Tratamento Especial**

### **1. Query Strings**
- **Detecção**: `/path?param1={Query1}&param2={Query2}`
- **Documentação**: Seção query_parameters detalhada
- **Substituição**: Marcação clara com {QueryX}

### **2. Authentication**
- **Headers**: apikey obrigatório
- **Documentação**: Tipo, localização, exemplos
- **Substituição**: {SUA_API_KEY} para clareza

### **3. Evolution API Expertise**
- **Conhecimento Prévio**: Endpoints nativos vs customizados
- **Contexto**: WhatsApp Business, instâncias, webhooks
- **Sinônimos**: "instância" = "instance", "webhook" = "gancho"

### **🌶️ 4. Enriquecimento Contextual Especializado**

#### **Arquivos de Suporte Disponíveis**:
- **`filters.md`** (900+ linhas): Sistema completo de filtros
- **`dual-webhook-system.md`** (316 linhas): Arquitetura dual webhook

#### **Triggers de Detecção**:
```python
# Para filtros
filter_triggers = ["filtro", "filter", "audio", "message", "text", "duration"]

# Para webhooks
webhook_triggers = ["webhook", "monitoring", "dual", "health", "retry", "payload"]
```

#### **Tipos de Enriquecimento**:
- **Practical Scenarios**: Cenários reais de uso (bot comandos, suporte, anti-spam)
- **Important Notes**: Informações críticas e limitações
- **Troubleshooting**: Erros comuns e soluções
- **Related Endpoints**: Endpoints relacionados ao contexto

---

## 🧪 **Estratégia de Testes**

### **1. Casos de Teste**
```python
test_cases = [
    {"query": "como criar uma instância", "expected": "create_instance"},
    {"query": "webhook de monitoramento", "expected": "webhook_health"},
    {"query": "filtros de áudio", "expected": "audio_filters_query"},
    {"query": "estatísticas da fila", "expected": "queue_stats"}
]
```

### **2. Validação**
- **Score Mínimo**: 0.8 para considerado sucesso
- **Tempo Máximo**: 3s por consulta
- **Taxa de Acerto**: 95%+ nos casos de teste

### **3. Métricas**
- **Precision**: Relevância dos resultados
- **Recall**: Cobertura dos endpoints
- **Response Time**: Velocidade de resposta
- **Cache Hit Rate**: Eficiência do cache

---

## 🚀 **Roadmap de Deploy**

### **Phase 1: Core Implementation** ✅
- [x] Estrutura básica do agente
- [x] Fase 1: Scoring ponderado
- [x] Fase 2: IA validation
- [x] Sistema de backup
- [x] JSON estruturado

### **Phase 2: Contextual Enhancement** 🌶️
- [x] Fase 3: Enriquecimento contextual
- [x] Detecção automática de contexto
- [x] Integração com filters.md
- [x] Integração com dual-webhook-system.md
- [x] Practical scenarios extraction

### **Phase 3: Optimization**
- [_] Performance tuning
- [_] Cache optimization
- [_] Error handling
- [_] Logging system

Inclui teste-query-monitoring.md

---


### **Phase 4: Advanced Features** (pending)
- [ ] Multi-provider AI support
- [ ] Advanced scoring algorithms
- [ ] Real-time index updates
- [ ] Analytics dashboard

Plano descrito em plano-Phase4-The-Future.md

---

## 📈 **Success Metrics**

### **Quantitative**
- **99.9%** first candidate accuracy
- **< 1%** backup system usage
- **< 2s** average response time
- **95%+** overall precision
- **🌶️ 80%+** enhancement trigger accuracy

### **Qualitative**
- **Infalível**: Zero false positives
- **Intuitivo**: Natural language understanding
- **Completo**: JSON super estruturado
- **Eficiente**: Minimal resource usage
- **🌶️ Contextualizado**: Enriquecimento relevante e prático

---

## 🔧 **Maintenance & Updates**

### **1. Index Updates**
- Automated scanning for new endpoints
- Version control for consolidated-map.json
- Backward compatibility

### **2. AI Model Updates**
- Easy provider switching
- Model performance monitoring
- A/B testing for improvements

### **3. Configuration Management**
- Environment-specific configs
- Hot-reload for scoring weights
- Feature flags

---

## 🎯 **Conclusão**

Este plano implementa um agente constructor/consultor que combina:

1. **Eficiência**: Scoring textual elimina 95% dos candidatos rapidamente
2. **Precisão**: IA valida apenas TOP 2, maximizando qualidade
3. **Confiabilidade**: Sistema de backup para casos edge
4. **🌶️ Contextualização**: Enriquecimento especializado pós-seleção
5. **Escalabilidade**: Arquitetura otimizada para crescimento
6. **Manutenibilidade**: Código limpo e bem estruturado

**Resultado**: Sistema infalível com 99.9% de precisão, < 2s de resposta e contexto especializado.