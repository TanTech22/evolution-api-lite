# 🔧 Correções Necessárias no Plano de Teste

## ❌ Inconsistências Identificadas

### 1. Endpoints de Webhook Global
| Linha | Incorreto no Plano | Correto na Documentação |
|-------|-------------------|-------------------------|
| 178 | `GET /global-webhook-config` | `GET /webhook/global/config` |
| 187 | `POST /global-webhook-config/test` | `POST /webhook/global/test` |

### 2. Endpoints de Instância com Filtros
| Linha | Incorreto na Documentação | Correto para Testes |
|-------|--------------------------|-----------------------|
| 106 | `GET /instance/5511930670388/filters` | `GET /instance/filters/5511930670388` |
| 115 | `PUT /instance/5511930670388/filters` | `PUT /instance/filters/5511930670388` |
| 136 | `GET /instance/5511930670388/filters/audio` | `GET /instance/filters/audio/5511930670388` |
| 145 | `GET /instance/5511930670388/filters/audio/stats` | `GET /instance/filters/audio/stats/5511930670388` |

### 3. Outros Endpoints que Precisam Verificação

#### Verificar se existem:
- `/queue/stats` ✅ (Confirmado na documentação)
- `/queue/metrics` ✅ (Confirmado na documentação)
- `/webhook/health` ✅ (Confirmado na documentação)
- `/webhook/metrics` ✅ (Confirmado na documentação)
- `/processing-feedback/*` ❓ (Precisa verificar)
- `/s3-cleanup/*` ❓ (Precisa verificar)

### 4. Padrão de URLs
- **Inconsistência**: Mistura de `http://` e `https://`
- **Recomendação**: Usar `http://localhost:8080` para desenvolvimento local

## 🎯 Causa Raiz do Problema

O problema ocorreu porque **criei o plano baseado no arquivo consolidado-map.json**, que pode ter informações abstraídas ou diferentes da implementação real. Deveria ter me baseado exclusivamente nos arquivos:

1. `/endpoints-and-hooks/native/description.md` - Para endpoints Evolution API originais
2. `/endpoints-and-hooks/custom/description.md` - Para endpoints customizados
3. Verificação direta com o código-fonte da API

## 🔍 Metodologia Correta para Validação

### Passo 1: Verificar Endpoints Reais
```bash
# Examinar rotas definidas no código
grep -r "router\." src/api/routes/

# Verificar controllers
ls src/api/controllers/

# Verificar documentação Swagger se disponível
curl http://localhost:8080/docs
```

### Passo 2: Teste de Conectividade Básica
```bash
# Testar se endpoint existe (deve retornar 200 ou 400, não 404)
curl -I http://localhost:8080/webhook/global/config -H "apikey: BQYHJGJHJ"
```

### Passo 3: Comparação Sistemática
```bash
# Extrair todos os endpoints da documentação
grep -o "curl.*https://localhost:8080[^\"]*" description.md | cut -d' ' -f3 | sort | uniq
```

## 📝 Próximos Passos

1. **Corrigir URLs no plano de teste**
2. **Verificar TODOS os endpoints listados**
3. **Testar conectividade básica de cada um**
4. **Criar versão validada do plano**

## 🚨 Lição Aprendida

**Sempre validar endpoints diretamente com:**
- Documentação oficial detalhada
- Código-fonte quando disponível
- Testes básicos de conectividade
- Nunca assumir que mapas consolidados estão corretos