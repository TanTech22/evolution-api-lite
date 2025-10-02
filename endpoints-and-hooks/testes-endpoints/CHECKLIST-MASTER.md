# 📋 **CHECKLIST MASTER - TESTES EVOLUTION API**

## 🎯 **CONTEXTO E CONFIGURAÇÕES**

### **Sistema Testado:**
- **API**: Evolution API v2.2.1
- **Servidor**: http://195.35.17.156:8080
- **API Key**: `BQYHJGJHJ`
- **Instância de Teste**: `5511930670388`
- **Status**: ✅ Sistema funcionando, validado em 2025-10-02

### **Comandos Base para Testes:**
```bash
# Modelo de comando para GET
curl -X GET "http://195.35.17.156:8080/ENDPOINT" -H "apikey: BQYHJGJHJ"

# Modelo de comando para POST
curl -X POST "http://195.35.17.156:8080/ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{"data": "here"}'
```

### **Monitoramento Disponível:**
- **Logs API**: `./monitoramento/monitor-api-logs.sh`
- **Performance**: `./monitoramento/monitor-performance.sh`
- **Database**: `./monitoramento/monitor-database.sh`
- **Webhooks**: `./monitoramento/monitor-webhooks.sh`

### **Resultados Esperados:**
- **Status 200**: Sucesso
- **fetchInstances**: `[]` (array vazio normal)
- **Status da API**: JSON com version "2.2.1"

---

## 🧪 **PROGRESSO DOS TESTES**

**Total**: 3/108 endpoints testados (2.8%)
- ✅ **Fase 1**: 3/3 (Básicos - ZERO risco)
- ⚠️ **Fase 2**: 4/13 (Settings & Messages - Baixo risco)
- ☐ **Fase 3**: 0/40 (Custom - Médio risco)
- ☐ **Fase 4**: 0/2 (Webhooks - Baixo risco)
- ☐ **Fase 5**: 0/51 (Chat & Social - Baixo risco)

---

# 🟢 **FASE 1: TESTES BÁSICOS (3 Endpoints - ZERO RISCO)**

## 1.1 Conectividade Básica
- ✅ **T001** - `GET /` - Status da API
- ✅ **T002** - `GET /instance/fetchInstances` - Listar Instâncias
- ✅ **T003** - `GET /instance/5511930670388/connectionState` - Estado da Conexão

---

# 🔵 **FASE 2: SETTINGS & MESSAGES (13 Endpoints)**

## 2.1 Settings Controller (2 Endpoints)
- ✅ **T004** - `GET /settings/find/5511930670388` - Buscar Configurações
- ✅ **T005** - `POST /settings/set/5511930670388` - Configurar Instância

## 2.2 Message Controller (11 Endpoints)
- ✅ **T006** - `POST /message/sendText/5511930670388` - Enviar Texto "\uD83D\uDE0E" para "number": "5511934593575"
- ⚠️ **T007** - `POST /message/sendStatus/5511930670388` - Enviar Status
- ⚠️ **T008** - `POST /message/sendMedia/5511930670388` - Enviar Mídia
- ⚠️ **T009** - `POST /message/sendWhatsAppAudio/5511930670388` - Enviar Áudio
- ⚠️ **T010** - `POST /message/sendSticker/5511930670388` - Enviar Sticker
- ⚠️ **T011** - `POST /message/sendLocation/5511930670388` - Enviar Localização 
- ⚠️ **T012** - `POST /message/sendContact/5511930670388` - Enviar Contato
- ✅ **T013** - `POST /message/sendReaction/5511930670388` - Enviar Reação 😎 para número "5511934593575" na última mensagem enviada
- ⚠️ **T014** - `POST /message/sendPoll/5511930670388` - Enviar Enquete
- ❌ **T015** - `POST /message/sendList/5511930670388` - Enviar Lista (deprecated)
- ❌ **T016** - `POST /message/sendButtons/5511930670388` - Enviar Botões (deprecated)

---

# 🟡 **FASE 3: ENDPOINTS CUSTOM (40 Endpoints)**

## 3.1 Instance Management - Basic (8 Endpoints)
- ⚠️ **T017** - `POST /instance/duplicate` - Duplicar Instância
- ⚠️ **T018** - `GET /instance/5511930670388/metrics` - Métricas da Instância ⚠️ (unkown, always skip)
- ✅ **T019** - `DELETE /instance/5511930670388/delete` - Deletar Instância Teste
- ✅ **T020** - `POST /instance/create` - Recriar Instância Teste
- ✅ **T021** - `GET /instance/5511930670388/connect` - Conectar Instância
- ⚠️ **T022** - `POST /instance/5511930670388/restart` - Reiniciar Instância
- ⚠️ **T023** - `DELETE /instance/5511930670388/logout` - Logout da Instância
- ⚠️ **T024** - `POST /instance/5511930670388/setPresence` - Definir Presença

## 3.2 Instance Management - Advanced (6 Endpoints)
- ✅ **T025** - `GET /instance/filters/5511930670388` - Consultar Filtros
- ✅ **T026** - `PUT /instance/filters/5511930670388` - Atualizar Filtros
- ✅ **T027** - `GET /instance/filters/audio/5511930670388` - Consultar Filtros de Áudio
- ✅ **T028** - `PUT /instance/filters/audio/5511930670388` - Atualizar Filtros de Áudio
- ☐ **T029** - `GET /instance/filters/audio/stats/5511930670388` - Estatísticas de Filtros de Áudio
- ☐ **T030** - `POST /instance/filters/audio/stats/reset/5511930670388` - Resetar Estatísticas de Áudio

## 3.3 Global Queue System (3 Endpoints)
- ☐ **T031** - `GET /queue/stats` - Estatísticas da Fila
- ☐ **T032** - `GET /queue/metrics` - Métricas da Fila
- ☐ **T033** - `POST /queue/metrics/reset` - Resetar Métricas da Fila

## 3.4 Dual Webhook System - Health (2 Endpoints)
- ☐ **T034** - `GET /webhook/health` - Saúde dos Webhooks
- ☐ **T035** - `GET /webhook/metrics` - Métricas dos Webhooks

## 3.5 Dual Webhook System - Logs (3 Endpoints)
- ☐ **T036** - `GET /webhook/logs?limit=50&type=all` - Consultar Logs
- ☐ **T037** - `GET /webhook/logs/export?format=json` - Exportar Logs
- ☐ **T038** - `DELETE /webhook/logs` - Limpar Logs

## 3.6 Dual Webhook System - Retry (3 Endpoints)
- ☐ **T039** - `GET /webhook/failed` - Listar Falhas
- ☐ **T040** - `DELETE /webhook/failed/webhook-id` - Remover Falha Específica
- ☐ **T041** - `DELETE /webhook/failed` - Limpar Todas as Falhas

## 3.7 Dual Webhook System - Testing (1 Endpoint)
- ☐ **T042** - `POST /webhook/test` - Testar Webhook

## 3.8 Global Webhook Configuration (4 Endpoints)
- ☐ **T043** - `GET /webhook/global/config` - Consultar Configuração Global
- ☐ **T044** - `POST /webhook/global/config` - Criar/Atualizar Configuração Global
- ☐ **T045** - `DELETE /webhook/global/config` - Desabilitar Configuração Global
- ☐ **T046** - `POST /webhook/global/test` - Testar Configuração Global

## 3.9 Processing Feedback System (4 Endpoints)
- ☐ **T047** - `POST /processing-feedback/start` - Iniciar Processamento
- ☐ **T048** - `POST /processing-feedback/finish` - Finalizar Processamento
- ☐ **T049** - `GET /processing-feedback/status` - Status do Processamento
- ☐ **T050** - `DELETE /processing-feedback/session/session-id` - Limpar Sessão

## 3.10 S3 Cleanup System (4 Endpoints)
- ☐ **T051** - `GET /s3-cleanup/schedule` - Consultar Agendamento
- ☐ **T052** - `PUT /s3-cleanup/schedule` - Atualizar Agendamento
- ☐ **T053** - `POST /s3-cleanup/execute` - Executar Cleanup Manual
- ☐ **T054** - `GET /s3-cleanup/status` - Status do Cleanup


---

# 🔴 **FASE 4: WEBHOOKS (2 Items)**

## 4.1 Configuração de Payloads de Webhook
- ☐ **T055** - **Webhook Principal** - Simular webhook principal
- ☐ **T056** - **Webhook Monitoramento** - Simular webhook de monitoramento

---

# 🔵 **FASE 5: CHAT & SOCIAL (51 Endpoints)**

## 5.1 Chat Controller (22 Endpoints)
- ☐ **T057** - `POST /chat/whatsappNumbers/5511930670388` - Verificar Números WhatsApp
- ☐ **T058** - `POST /chat/markMessageAsRead/5511930670388` - Marcar como Lida
- ☐ **T059** - `POST /chat/markChatUnread/5511930670388` - Marcar Chat como Não Lido
- ☐ **T060** - `POST /chat/archiveChat/5511930670388` - Arquivar Chat
- ☐ **T061** - `DELETE /chat/deleteMessage/5511930670388` - Apagar Mensagem
- ☐ **T062** - `PUT /chat/updateMessage/5511930670388` - Atualizar Mensagem
- ☐ **T063** - `POST /chat/sendPresence/5511930670388` - Enviar Presença
- ☐ **T064** - `POST /chat/blockUnblock/5511930670388` - Status de Bloqueio
- ☐ **T065** - `POST /chat/fetchProfilePictureUrl/5511930670388` - Buscar Foto de Perfil
- ☐ **T066** - `POST /chat/getBase64FromMediaMessage/5511930670388` - Obter Base64 de Mídia
- ☐ **T067** - `POST /chat/findContacts/5511930670388` - Buscar Contatos
- ☐ **T068** - `POST /chat/findMessages/5511930670388` - Buscar Mensagens
- ☐ **T069** - `POST /chat/findStatusMessage/5511930670388` - Buscar Mensagens de Status
- ☐ **T070** - `GET /chat/fetchChats/5511930670388` - Buscar Chats
- ☐ **T071** - `POST /chat/fetchBusinessProfile/5511930670388` - Buscar Perfil Comercial
- ☐ **T072** - `POST /chat/fetchProfile/5511930670388` - Buscar Perfil
- ☐ **T073** - `POST /chat/updateProfileName/5511930670388` - Atualizar Nome do Perfil
- ☐ **T074** - `POST /chat/updateProfileStatus/5511930670388` - Atualizar Status do Perfil
- ☐ **T075** - `POST /chat/updateProfilePicture/5511930670388` - Atualizar Foto do Perfil
- ☐ **T076** - `DELETE /chat/removeProfilePicture/5511930670388` - Remover Foto do Perfil
- ☐ **T077** - `GET /chat/fetchPrivacySettings/5511930670388` - Buscar Configurações de Privacidade
- ☐ **T078** - `POST /chat/updatePrivacySettings/5511930670388` - Atualizar Configurações de Privacidade

## 5.2 Group Controller (15 Endpoints)
- ☐ **T079** - `POST /group/create/5511930670388` - Criar Grupo
- ☐ **T080** - `POST /group/updateGroupPicture/5511930670388` - Atualizar Foto do Grupo
- ☐ **T081** - `POST /group/updateGroupSubject/5511930670388` - Atualizar Assunto do Grupo
- ☐ **T082** - `POST /group/updateGroupDescription/5511930670388` - Atualizar Descrição do Grupo
- ☐ **T083** - `GET /group/inviteCode/5511930670388` - Obter Código de Convite
- ☐ **T084** - `POST /group/revokeInviteCode/5511930670388` - Revogar Código de Convite
- ☐ **T085** - `POST /group/sendInvite/5511930670388` - Enviar Convite
- ☐ **T086** - `POST /group/inviteInfo/5511930670388` - Informações do Convite
- ☐ **T087** - `POST /group/findGroupInfos/5511930670388` - Buscar Informações do Grupo
- ☐ **T088** - `POST /group/fetchAllGroups/5511930670388` - Buscar Todos os Grupos
- ☐ **T089** - `POST /group/participants/5511930670388` - Listar Participantes
- ☐ **T090** - `POST /group/updateGroupParticipant/5511930670388` - Atualizar Participante
- ☐ **T091** - `POST /group/updateGroupSetting/5511930670388` - Atualizar Configurações
- ☐ **T092** - `POST /group/toggleEphemeral/5511930670388` - Ativar/Desativar Mensagens Temporárias
- ☐ **T093** - `DELETE /group/leaveGroup/5511930670388` - Sair do Grupo

## 5.3 Evolution Bot (8 Endpoints)
- ☐ **T094** - `POST /bot/create/5511930670388` - Criar Bot
- ☐ **T095** - `GET /bot/find/5511930670388` - Buscar Bot
- ☐ **T096** - `GET /bot/find/5511930670388/bot-id` - Buscar Bot Específico
- ☐ **T097** - `PUT /bot/update/5511930670388/bot-id` - Atualizar Bot
- ☐ **T098** - `DELETE /bot/delete/5511930670388/bot-id` - Deletar Bot
- ☐ **T099** - `POST /bot/settings/5511930670388` - Configurações do Bot
- ☐ **T100** - `GET /bot/fetchConfigurations/5511930670388` - Buscar Configurações
- ☐ **T101** - `POST /bot/changeStatus/5511930670388` - Alterar Status

## 5.4 Websocket (2 Endpoints)
- ☐ **T102** - `POST /websocket/set/5511930670388` - Configurar Websocket
- ☐ **T103** - `GET /websocket/find/5511930670388` - Buscar Configurações Websocket

## 5.5 Integrações (4 Endpoints)
- ☐ **T104** - `POST /sqs/set/5511930670388` - Configurar SQS
- ☐ **T105** - `GET /sqs/find/5511930670388` - Buscar Configurações SQS
- ☐ **T106** - `POST /rabbitmq/set/5511930670388` - Configurar RabbitMQ
- ☐ **T107** - `GET /rabbitmq/find/5511930670388` - Buscar Configurações RabbitMQ

---

## 📊 **REGISTRO DE SESSÕES**

### **Sessão 1** - 2025-10-02
- **Claude**: Assistant que criou o sistema
- **Testes realizados**: Sistema validado, infraestrutura completa
- **Status**: ☐ 0/108 endpoints testados
- **Próximo**: Começar testes da Fase 1

### **Sessão 2** - Data: ___________
- **Claude**: _________________
- **Testes realizados**: _______
- **Status**: ☐ ___/108 endpoints testados
- **Próximo**: _________________

### **Sessão 3** - Data: ___________
- **Claude**: _________________
- **Testes realizados**: _______
- **Status**: ☐ ___/108 endpoints testados
- **Próximo**: _________________

---

## 🚨 **INSTRUÇÕES PARA PRÓXIMAS SESSÕES**

### **Para Continuar os Testes:**
1. Mostrar este arquivo para o Claude
2. Verificar se a API está rodando: `curl -s http://195.35.17.156:8080/`
3. Escolher endpoints da lista para testar
4. Marcar ✅ os testados com sucesso
5. Anotar problemas encontrados
6. Atualizar contadores de progresso

### **Comando Base para Qualquer Endpoint:**
```bash
curl -X GET "http://195.35.17.156:8080/ENDPOINT" \
  -H "apikey: BQYHJGJHJ" \
  -H "Accept: application/json"
```

### **Em Caso de Problemas:**
- Verificar se Evolution API está rodando
- Verificar se IP 195.35.17.156:8080 está acessível
- Usar API Key: `BQYHJGJHJ`
- Consultar documentação em `/root/evolution-api-lite/endpoints-and-hooks/testes-endpoints/`

---

**📝 Última atualização**: 2025-10-02 12:55 UTC
**🎯 Objetivo**: Testar 100% dos 108 endpoints da Evolution API
**✅ Status**: Sistema pronto, aguardando início dos testes


### Dúvidas
Criar, Duplicar ou Conectar uma instância que já existe e está conectada:

 Cenários possíveis:
  1. ❌ Erro 409 Conflict - "Instância já existe"
  2. ❌ Erro 400 Bad Request - "Nome já em uso"
  3. ⚠️ Desconexão forçada - Desconecta a atual e cria nova
  4. ✅ Sucesso - Substitui a existente

  T019 - GET /instance/5511930670388/connect (Conectar):

  Cenários possíveis:
  1. ✅ 200 OK - "Já conectada, mantém conexão"
  2. ✅ 200 OK - "Força nova conexão/QR Code"
  3. ⚠️ Timeout - Pode travar tentando reconectar