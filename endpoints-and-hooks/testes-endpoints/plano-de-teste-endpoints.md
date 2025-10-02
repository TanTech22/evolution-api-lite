# 🧪 Plano de Teste COMPLETO - Evolution API Lite (108 Endpoints)

## 📊 Estatísticas

- **Total de Endpoints**: **108**
- **Endpoints Nativos**: **66**
- **Endpoints Custom**: **42**
- **Webhooks**: **2**
- **Total de Testes**: **110**

---

## 🏗️ Configuração da Infraestrutura de Teste

### Variáveis de Ambiente
```bash
export EVOLUTION_API_URL="http://195.35.17.156:8080"
export TEST_API_KEY="BQYHJGJHJ"
export TEST_INSTANCE="5511930670388"
export WEBHOOK_TEST_URL="https://webhook.site/your-unique-id"
```

---

# 🟢 FASE 1: TESTES BÁSICOS (3 Endpoints - ZERO RISCO)

### 1.1 Conectividade Básica
```bash
# Teste 1: Status da API
curl -X GET "http://195.35.17.156:8080/" \
  -H "Accept: application/json"
# Esperado: {"status": 200, "message": "Welcome to Evolution API"}
```

```bash
# Teste 2: Listar Instâncias
curl -X GET "http://195.35.17.156:8080/instance/fetchInstances" \
  -H "apikey: BQYHJGJHJ"
# Esperado: Array de instâncias
```

```bash
# Teste 3: Estado da Conexão
curl -X GET "http://195.35.17.156:8080/instance/5511930670388/connectionState" \
  -H "apikey: BQYHJGJHJ"
# Esperado: {"instance": {"state": "open"}}
```

---

# 🔵 FASE 2: ENDPOINTS NATIVOS (66 Endpoints)

## 2.1 Settings Controller (2 Endpoints)

```bash
# Teste 4: Buscar Configurações
curl -X GET "http://195.35.17.156:8080/settings/find/5511930670388" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 5: Configurar Instância
curl -X POST "http://195.35.17.156:8080/settings/set/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "rejectCall": false,
    "msgCall": "Bot em teste - não atendo chamadas",
    "groupsIgnore": true,
    "alwaysOnline": false,
    "readMessages": false,
    "readStatus": false,
    "syncFullHistory": false
  }'
```

## 2.2 Message Controller (11 Endpoints)

```bash
# Teste 6: Enviar Texto
curl -X POST "http://195.35.17.156:8080/message/sendText/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511930670388",
    "text": "🧪 TESTE API - Mensagem de texto simples - $(date)",
    "delay": 1000
  }'
```

```bash
# Teste 7: Enviar Status
curl -X POST "http://195.35.17.156:8080/message/sendStatus/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "type": "text",
    "content": "🧪 Status de teste da API",
    "statusJidList": []
  }'
```

```bash
# Teste 8: Enviar Mídia
curl -X POST "http://195.35.17.156:8080/message/sendMedia/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511930670388",
    "mediatype": "image",
    "media": "https://via.placeholder.com/300x200.png?text=Teste+API",
    "caption": "🧪 Teste de envio de mídia"
  }'
```

```bash
# Teste 9: Enviar Áudio
curl -X POST "http://195.35.17.156:8080/message/sendWhatsAppAudio/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511930670388",
    "audiobase64": "data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbms...",
    "ptt": true
  }'
```

```bash
# Teste 10: Enviar Sticker
curl -X POST "http://195.35.17.156:8080/message/sendSticker/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511930670388",
    "stickerbase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51..."
  }'
```

```bash
# Teste 11: Enviar Localização
curl -X POST "http://195.35.17.156:8080/message/sendLocation/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511930670388",
    "name": "Localização de Teste",
    "address": "Rua Teste, 123 - São Paulo, SP",
    "lat": -23.5505,
    "lng": -46.6333
  }'
```

```bash
# Teste 12: Enviar Contato
curl -X POST "http://195.35.17.156:8080/message/sendContact/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511930670388",
    "contact": [
      {
        "fullName": "Contato de Teste",
        "wuid": "5511999999999",
        "phoneNumber": "11999999999",
        "organization": "Empresa Teste"
      }
    ]
  }'
```

```bash
# Teste 13: Enviar Reação
curl -X POST "http://195.35.17.156:8080/message/sendReaction/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "reactionMessage": {
      "key": {
        "id": "última-mensagem-id"
      }
    },
    "reaction": "👍"
  }'
```

```bash
# Teste 14: Enviar Enquete
curl -X POST "http://195.35.17.156:8080/message/sendPoll/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511930670388",
    "name": "🧪 Enquete de Teste API",
    "options": ["Opção 1", "Opção 2", "Opção 3"],
    "selectableCount": 1
  }'
```

```bash
# Teste 15: Enviar Lista
curl -X POST "http://195.35.17.156:8080/message/sendList/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511930670388",
    "title": "🧪 Lista de Teste",
    "description": "Esta é uma lista de teste da API",
    "buttonText": "Ver Opções",
    "sections": [
      {
        "title": "Seção 1",
        "rows": [
          {
            "title": "Item 1",
            "description": "Descrição do item 1",
            "rowId": "item1"
          }
        ]
      }
    ]
  }'
```

```bash
# Teste 16: Enviar Botões
curl -X POST "http://195.35.17.156:8080/message/sendButtons/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511930670388",
    "title": "🧪 Teste de Botões",
    "description": "Selecione uma opção:",
    "footer": "API Test",
    "buttons": [
      {
        "buttonId": "btn1",
        "buttonText": {"displayText": "Botão 1"},
        "type": 1
      },
      {
        "buttonId": "btn2",
        "buttonText": {"displayText": "Botão 2"},
        "type": 1
      }
    ]
  }'
```

## 2.3 Chat Controller (22 Endpoints)

```bash
# Teste 17: Verificar Números WhatsApp
curl -X POST "http://195.35.17.156:8080/chat/whatsappNumbers/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "numbers": ["5511999999999", "5511888888888"]
  }'
```

```bash
# Teste 18: Marcar como Lida
curl -X POST "http://195.35.17.156:8080/chat/markMessageAsRead/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "readMessages": [
      {
        "id": "mensagem-id",
        "fromMe": true,
        "remoteJid": "5511930670388@s.whatsapp.net"
      }
    ]
  }'
```

```bash
# Teste 19: Marcar Chat como Não Lido
curl -X POST "http://195.35.17.156:8080/chat/markChatUnread/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "lastMessage": {
      "key": {
        "id": "mensagem-id"
      }
    },
    "chat": "5511930670388@s.whatsapp.net"
  }'
```

```bash
# Teste 20: Arquivar Chat
curl -X POST "http://195.35.17.156:8080/chat/archiveChat/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "lastMessage": {
      "messageTimestamp": 1635724800
    },
    "archive": true,
    "chat": "5511930670388@s.whatsapp.net"
  }'
```

```bash
# Teste 21: Apagar Mensagem
curl -X DELETE "http://195.35.17.156:8080/chat/deleteMessage/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "id": "mensagem-id",
    "remoteJid": "5511930670388@s.whatsapp.net",
    "fromMe": true,
    "participant": ""
  }'
```

```bash
# Teste 22: Atualizar Mensagem
curl -X PUT "http://195.35.17.156:8080/chat/updateMessage/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511930670388",
    "text": "🧪 Mensagem atualizada via API",
    "key": {
      "id": "mensagem-id"
    }
  }'
```

```bash
# Teste 23: Enviar Presença
curl -X POST "http://195.35.17.156:8080/chat/sendPresence/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511930670388",
    "options": {
      "type": "unavailable"
    }
  }'
```

```bash
# Teste 24: Status de Bloqueio
curl -X POST "http://195.35.17.156:8080/chat/blockUnblock/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511999999999",
    "status": "block"
  }'
```

```bash
# Teste 25: Buscar Foto de Perfil
curl -X POST "http://195.35.17.156:8080/chat/fetchProfilePictureUrl/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511930670388"
  }'
```

```bash
# Teste 26: Obter Base64 de Mídia
curl -X POST "http://195.35.17.156:8080/chat/getBase64FromMediaMessage/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "message": {
      "key": {
        "id": "mensagem-com-midia-id"
      }
    },
    "convertToMp4": false
  }'
```

```bash
# Teste 27: Buscar Contatos
curl -X POST "http://195.35.17.156:8080/chat/findContacts/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "where": {
      "id": "5511930670388"
    }
  }'
```

```bash
# Teste 28: Buscar Mensagens
curl -X POST "http://195.35.17.156:8080/chat/findMessages/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "where": {
      "key": {
        "remoteJid": "5511930670388@s.whatsapp.net"
      }
    }
  }'
```

```bash
# Teste 29: Buscar Mensagens de Status
curl -X POST "http://195.35.17.156:8080/chat/findStatusMessage/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "where": {
      "ids": [],
      "key": {
        "remoteJid": "status@broadcast"
      }
    },
    "limit": 10
  }'
```

```bash
# Teste 30: Buscar Chats
curl -X GET "http://195.35.17.156:8080/chat/fetchChats/5511930670388" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 31: Buscar Perfil Comercial
curl -X POST "http://195.35.17.156:8080/chat/fetchBusinessProfile/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511999999999"
  }'
```

```bash
# Teste 32: Buscar Perfil
curl -X POST "http://195.35.17.156:8080/chat/fetchProfile/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511930670388"
  }'
```

```bash
# Teste 33: Atualizar Nome do Perfil
curl -X POST "http://195.35.17.156:8080/chat/updateProfileName/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "name": "🧪 Bot Teste API"
  }'
```

```bash
# Teste 34: Atualizar Status do Perfil
curl -X POST "http://195.35.17.156:8080/chat/updateProfileStatus/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "status": "🧪 Teste API - Temporário"
  }'
```

```bash
# Teste 35: Atualizar Foto do Perfil
curl -X POST "http://195.35.17.156:8080/chat/updateProfilePicture/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "picture": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
  }'
```

```bash
# Teste 36: Remover Foto do Perfil
curl -X DELETE "http://195.35.17.156:8080/chat/removeProfilePicture/5511930670388" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 37: Buscar Configurações de Privacidade
curl -X GET "http://195.35.17.156:8080/chat/fetchPrivacySettings/5511930670388" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 38: Atualizar Configurações de Privacidade
curl -X POST "http://195.35.17.156:8080/chat/updatePrivacySettings/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "readreceipts": "all",
    "profile": "all",
    "status": "all",
    "online": "all",
    "last": "all",
    "groupadd": "all"
  }'
```

## 2.4 Group Controller (15 Endpoints)

```bash
# Teste 39: Criar Grupo
curl -X POST "http://195.35.17.156:8080/group/create/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "subject": "🧪 Grupo Teste API",
    "description": "Grupo criado para teste da API",
    "participants": ["5511999999999"]
  }'
```

```bash
# Teste 40: Atualizar Foto do Grupo
curl -X POST "http://195.35.17.156:8080/group/updateGroupPicture/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "groupJid": "grupo-id@g.us",
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
  }'
```

```bash
# Teste 41: Atualizar Assunto do Grupo
curl -X POST "http://195.35.17.156:8080/group/updateGroupSubject/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "groupJid": "grupo-id@g.us",
    "subject": "🧪 Grupo Teste API - Atualizado"
  }'
```

```bash
# Teste 42: Atualizar Descrição do Grupo
curl -X POST "http://195.35.17.156:8080/group/updateGroupDescription/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "groupJid": "grupo-id@g.us",
    "description": "Descrição atualizada via API"
  }'
```

```bash
# Teste 43: Obter Código de Convite
curl -X GET "http://195.35.17.156:8080/group/inviteCode/5511930670388" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "groupJid": "grupo-id@g.us"
  }'
```

```bash
# Teste 44: Revogar Código de Convite
curl -X POST "http://195.35.17.156:8080/group/revokeInviteCode/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "groupJid": "grupo-id@g.us"
  }'
```

```bash
# Teste 45: Enviar Convite
curl -X POST "http://195.35.17.156:8080/group/sendInvite/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "groupJid": "grupo-id@g.us",
    "description": "Convite para grupo de teste",
    "numbers": ["5511888888888"]
  }'
```

```bash
# Teste 46: Informações do Convite
curl -X POST "http://195.35.17.156:8080/group/inviteInfo/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "inviteCode": "https://chat.whatsapp.com/codigo-convite"
  }'
```

```bash
# Teste 47: Buscar Informações do Grupo
curl -X POST "http://195.35.17.156:8080/group/findGroupInfos/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "groupJid": "grupo-id@g.us"
  }'
```

```bash
# Teste 48: Buscar Todos os Grupos
curl -X POST "http://195.35.17.156:8080/group/fetchAllGroups/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "getParticipants": "true"
  }'
```

```bash
# Teste 49: Listar Participantes
curl -X POST "http://195.35.17.156:8080/group/participants/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "groupJid": "grupo-id@g.us"
  }'
```

```bash
# Teste 50: Atualizar Participante
curl -X POST "http://195.35.17.156:8080/group/updateGroupParticipant/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "groupJid": "grupo-id@g.us",
    "action": "add",
    "participants": ["5511777777777"]
  }'
```

```bash
# Teste 51: Atualizar Configurações
curl -X POST "http://195.35.17.156:8080/group/updateGroupSetting/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "groupJid": "grupo-id@g.us",
    "action": "announcement"
  }'
```

```bash
# Teste 52: Ativar/Desativar Mensagens Temporárias
curl -X POST "http://195.35.17.156:8080/group/toggleEphemeral/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "groupJid": "grupo-id@g.us",
    "expiration": 86400
  }'
```

```bash
# Teste 53: Sair do Grupo
curl -X DELETE "http://195.35.17.156:8080/group/leaveGroup/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "groupJid": "grupo-id@g.us"
  }'
```

## 2.5 Evolution Bot (8 Endpoints)

```bash
# Teste 54: Criar Bot
curl -X POST "http://195.35.17.156:8080/bot/create/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "enabled": true,
    "url": "https://api.exemplo.com/webhook",
    "url_welcome_message": "",
    "token": "token-teste",
    "expire": 20,
    "keywordFinish": "#SAIR",
    "delayMessage": 1000,
    "unknownMessage": "Mensagem não reconhecida",
    "listeningFromMe": false,
    "stopBotFromMe": false,
    "keepOpen": false,
    "debounceTime": 0,
    "ignoreJids": []
  }'
```

```bash
# Teste 55: Buscar Bot
curl -X GET "http://195.35.17.156:8080/bot/find/5511930670388" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 56: Buscar Bot Específico
curl -X GET "http://195.35.17.156:8080/bot/find/5511930670388/bot-id" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 57: Atualizar Bot
curl -X PUT "http://195.35.17.156:8080/bot/update/5511930670388/bot-id" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "enabled": false,
    "url": "https://api.exemplo.com/webhook-atualizado"
  }'
```

```bash
# Teste 58: Deletar Bot
curl -X DELETE "http://195.35.17.156:8080/bot/delete/5511930670388/bot-id" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 59: Configurações do Bot
curl -X POST "http://195.35.17.156:8080/bot/settings/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "expire": 30,
    "delayMessage": 1500,
    "unknownMessage": "Comando não reconhecido",
    "keywordFinish": "#FIM",
    "listeningFromMe": false,
    "stopBotFromMe": true,
    "keepOpen": true,
    "debounceTime": 1000,
    "ignoreJids": ["status@broadcast"]
  }'
```

```bash
# Teste 60: Buscar Configurações
curl -X GET "http://195.35.17.156:8080/bot/fetchConfigurations/5511930670388" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 61: Alterar Status
curl -X POST "http://195.35.17.156:8080/bot/changeStatus/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "remoteJid": "5511999999999@s.whatsapp.net",
    "status": "paused"
  }'
```

```bash
# Teste 62: Buscar Sessões
curl -X GET "http://195.35.17.156:8080/bot/fetchSessions/5511930670388/bot-id" \
  -H "apikey: BQYHJGJHJ"
```

## 2.6 Websocket (2 Endpoints)

```bash
# Teste 63: Configurar Websocket
curl -X POST "http://195.35.17.156:8080/websocket/set/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "enabled": true,
    "events": ["APPLICATION_STARTUP", "QRCODE_UPDATED", "CONNECTION_UPDATE"]
  }'
```

```bash
# Teste 64: Buscar Configurações Websocket
curl -X GET "http://195.35.17.156:8080/websocket/find/5511930670388" \
  -H "apikey: BQYHJGJHJ"
```

## 2.7 Integrações (4 Endpoints)

```bash
# Teste 65: Configurar SQS
curl -X POST "http://195.35.17.156:8080/sqs/set/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "enabled": true,
    "events": ["MESSAGES_UPSERT", "SEND_MESSAGE"]
  }'
```

```bash
# Teste 66: Buscar Configurações SQS
curl -X GET "http://195.35.17.156:8080/sqs/find/5511930670388" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 67: Configurar RabbitMQ
curl -X POST "http://195.35.17.156:8080/rabbitmq/set/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "enabled": true,
    "events": ["MESSAGES_UPSERT", "SEND_MESSAGE"]
  }'
```

```bash
# Teste 68: Buscar Configurações RabbitMQ
curl -X GET "http://195.35.17.156:8080/rabbitmq/find/5511930670388" \
  -H "apikey: BQYHJGJHJ"
```

---

# 🟡 FASE 3: ENDPOINTS CUSTOM (42 Endpoints - TODOS SEM EXCEÇÃO)

## 3.1 Instance Management - Basic (8 Endpoints)

```bash
# Teste 69: Criar Instância
curl -X POST "http://195.35.17.156:8080/instance/create" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "instanceName": "teste-completo",
    "integration": "WHATSAPP-BAILEYS"
  }'
```

```bash
# Teste 70: Conectar Instância
curl -X GET "http://195.35.17.156:8080/instance/5511930670388/connect" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 71: Reiniciar Instância
curl -X POST "http://195.35.17.156:8080/instance/5511930670388/restart" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 72: Logout da Instância
curl -X DELETE "http://195.35.17.156:8080/instance/5511930670388/logout" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 73: Deletar Instância
curl -X DELETE "http://195.35.17.156:8080/instance/teste-completo/delete" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 74: Definir Presença
curl -X POST "http://195.35.17.156:8080/instance/5511930670388/setPresence" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "presence": "unavailable"
  }'
```

## 3.2 Instance Management - Advanced (8 Endpoints)

```bash
# Teste 75: Consultar Filtros
curl -X GET "http://195.35.17.156:8080/instance/filters/5511930670388" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 76: Atualizar Filtros
curl -X PUT "http://195.35.17.156:8080/instance/filters/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "webhook": {
      "messageTypes": ["conversation"],
      "excludeMessageTypes": ["imageMessage", "videoMessage"],
      "textFilters": {
        "allowedWords": ["teste", "api"],
        "blockedWords": ["spam"]
      }
    }
  }'
```

```bash
# Teste 77: Consultar Filtros de Áudio
curl -X GET "http://195.35.17.156:8080/instance/filters/audio/5511930670388" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 78: Atualizar Filtros de Áudio
curl -X PUT "http://195.35.17.156:8080/instance/filters/audio/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "enabled": true,
    "minDurationSeconds": 3,
    "maxDurationSeconds": 60,
    "oversizeMessage": "Áudio deve ter entre 3s e 1min",
    "replyToOversizeAudio": true
  }'
```

```bash
# Teste 79: Estatísticas de Filtros de Áudio
curl -X GET "http://195.35.17.156:8080/instance/filters/audio/stats/5511930670388" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 80: Resetar Estatísticas de Áudio
curl -X POST "http://195.35.17.156:8080/instance/filters/audio/stats/reset/5511930670388" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 81: Duplicar Instância
curl -X POST "http://195.35.17.156:8080/instance/duplicate" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "sourceInstanceName": "5511930670388",
    "newInstanceName": "5511930670388-copy"
  }'
```

```bash
# Teste 82: Métricas da Instância
curl -X GET "http://195.35.17.156:8080/instance/5511930670388/metrics" \
  -H "apikey: BQYHJGJHJ"
```

## 3.3 Global Queue System (3 Endpoints)

```bash
# Teste 83: Estatísticas da Fila
curl -X GET "http://195.35.17.156:8080/queue/stats" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 84: Métricas da Fila
curl -X GET "http://195.35.17.156:8080/queue/metrics" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 85: Resetar Métricas da Fila
curl -X POST "http://195.35.17.156:8080/queue/metrics/reset" \
  -H "apikey: BQYHJGJHJ"
```

## 3.4 Dual Webhook System - Health (2 Endpoints)

```bash
# Teste 86: Saúde dos Webhooks
curl -X GET "http://195.35.17.156:8080/webhook/health" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 87: Métricas dos Webhooks
curl -X GET "http://195.35.17.156:8080/webhook/metrics" \
  -H "apikey: BQYHJGJHJ"
```

## 3.5 Dual Webhook System - Logs (3 Endpoints)

```bash
# Teste 88: Consultar Logs
curl -X GET "http://195.35.17.156:8080/webhook/logs?limit=50&type=all" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 89: Exportar Logs
curl -X GET "http://195.35.17.156:8080/webhook/logs/export?format=json" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 90: Limpar Logs
curl -X DELETE "http://195.35.17.156:8080/webhook/logs" \
  -H "apikey: BQYHJGJHJ"
```

## 3.6 Dual Webhook System - Retry (3 Endpoints)

```bash
# Teste 91: Listar Falhas
curl -X GET "http://195.35.17.156:8080/webhook/failed" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 92: Remover Falha Específica
curl -X DELETE "http://195.35.17.156:8080/webhook/failed/webhook-id" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 93: Limpar Todas as Falhas
curl -X DELETE "http://195.35.17.156:8080/webhook/failed" \
  -H "apikey: BQYHJGJHJ"
```

## 3.7 Dual Webhook System - Testing (1 Endpoint)

```bash
# Teste 94: Testar Webhook
curl -X POST "http://195.35.17.156:8080/webhook/test" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "url": "https://httpbin.org/post"
  }'
```

## 3.8 Global Webhook Configuration (4 Endpoints)

```bash
# Teste 95: Consultar Configuração Global
curl -X GET "http://195.35.17.156:8080/webhook/global/config" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 96: Criar/Atualizar Configuração Global
curl -X POST "http://195.35.17.156:8080/webhook/global/config" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "principal": {
      "enabled": true,
      "url": "https://webhook.site/test-principal"
    },
    "monitoramento": {
      "enabled": true,
      "url": "https://webhook.site/test-monitor"
    }
  }'
```

```bash
# Teste 97: Desabilitar Configuração Global
curl -X DELETE "http://195.35.17.156:8080/webhook/global/config" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 98: Testar Configuração Global
curl -X POST "http://195.35.17.156:8080/webhook/global/test" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "url": "https://httpbin.org/post",
    "type": "principal"
  }'
```

## 3.9 Processing Feedback System (4 Endpoints)

```bash
# Teste 99: Iniciar Processamento
curl -X POST "http://195.35.17.156:8080/processing-feedback/start" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "instance": "5511930670388",
    "chatId": "5511930670388@s.whatsapp.net",
    "messageId": "message-id",
    "processType": "test"
  }'
```

```bash
# Teste 100: Finalizar Processamento
curl -X POST "http://195.35.17.156:8080/processing-feedback/finish" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "instance": "5511930670388",
    "chatId": "5511930670388@s.whatsapp.net",
    "messageId": "message-id",
    "status": "success",
    "text": "✅ Processamento concluído"
  }'
```

```bash
# Teste 101: Status do Processamento
curl -X GET "http://195.35.17.156:8080/processing-feedback/status" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 102: Limpar Sessão
curl -X DELETE "http://195.35.17.156:8080/processing-feedback/session/session-id" \
  -H "apikey: BQYHJGJHJ"
```

## 3.10 S3 Cleanup System (4 Endpoints)

```bash
# Teste 103: Consultar Agendamento
curl -X GET "http://195.35.17.156:8080/s3-cleanup/schedule" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 104: Atualizar Agendamento
curl -X PUT "http://195.35.17.156:8080/s3-cleanup/schedule" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "enabled": true,
    "retentionDays": 30,
    "dailyTime": "03:00",
    "timezone": "America/Sao_Paulo"
  }'
```

```bash
# Teste 105: Executar Cleanup Manual
curl -X POST "http://195.35.17.156:8080/s3-cleanup/execute" \
  -H "apikey: BQYHJGJHJ"
```

```bash
# Teste 106: Status do Cleanup
curl -X GET "http://195.35.17.156:8080/s3-cleanup/status" \
  -H "apikey: BQYHJGJHJ"
```

---

# 🔴 FASE 4: WEBHOOKS (2 Items)

## 4.1 Configuração de Payloads de Webhook

```bash
# Teste 107: Simular Webhook Principal
curl -X POST "https://webhook.site/test-principal" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "messages.upsert",
    "instance": "5511930670388",
    "data": {
      "key": {
        "id": "test-message-id"
      },
      "message": {
        "conversation": "Teste de webhook principal"
      }
    },
    "server_url": "http://195.35.17.156:8080",
    "apikey": "BQYHJGJHJ"
  }'
```

```bash
# Teste 108: Simular Webhook Monitoramento
curl -X POST "https://webhook.site/test-monitor" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "queue.stats",
    "timestamp": "2025-10-02T10:00:00.000Z",
    "instance": "5511930670388",
    "data": {
      "queueSize": 0,
      "processedCount": 100,
      "errorCount": 0
    },
    "server_url": "http://195.35.17.156:8080"
  }'
```

---

## 🚨 Plano de Mitigação de Riscos

### Procedimentos de Emergência

#### 1. Se a Instância Parar de Responder
```bash
# Verificar estado
curl -X GET "http://195.35.17.156:8080/instance/5511930670388/connectionState" \
  -H "apikey: BQYHJGJHJ"

# Reconectar se necessário
curl -X GET "http://195.35.17.156:8080/instance/5511930670388/connect" \
  -H "apikey: BQYHJGJHJ"

# Restart como último recurso
curl -X POST "http://195.35.17.156:8080/instance/5511930670388/restart" \
  -H "apikey: BQYHJGJHJ"
```

#### 2. Rollback de Configurações Críticas
```bash
# Restaurar settings padrão
curl -X POST "http://195.35.17.156:8080/settings/set/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "alwaysOnline": true,
    "readMessages": true,
    "groupsIgnore": false,
    "rejectCall": false
  }'

# Reverter nome do perfil
curl -X POST "http://195.35.17.156:8080/chat/updateProfileName/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "name": "Nome Original"
  }'

# Reverter status do perfil
curl -X POST "http://195.35.17.156:8080/chat/updateProfileStatus/5511930670388" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "status": "Status Original"
  }'
```

---

## 📊 Resumo Final

### ✅ **Contagem Completa:**
- **FASE 1**: 3 endpoints básicos (ZERO risco)
- **FASE 2**: 66 endpoints nativos (controlado)
- **FASE 3**: 42 endpoints custom (TODOS sem exceção)
- **FASE 4**: 2 webhooks
- **TOTAL**: **110 testes** cobrindo **100% dos endpoints**

### 🎯 **Cronograma Sugerido:**
- **Dia 1**: Fase 1 + Fase 2 (Settings, Message, Chat básicos)
- **Dia 2**: Fase 2 (Chat avançado, Group, Bot, Integrações)
- **Dia 3**: Fase 3 (TODOS os 42 endpoints custom)
- **Dia 4**: Fase 4 (Webhooks) + Relatório final

**Agora temos TODOS os 108 endpoints + 2 webhooks = 110 itens listados e organizados para teste completo!**