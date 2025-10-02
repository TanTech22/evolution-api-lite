# 📚 Documentação Endpoints Evolution API Lite - Core

Esta documentação cobre todos os endpoints **originais** da Evolution API Lite, incluindo as funcionalidades básicas de WhatsApp para desenvolvimento de integrações e automações.

## 🎯 Visão Geral

A Evolution API Lite oferece endpoints completos para:
- **Send Message**: Envio de todos os tipos de mensagem WhatsApp
- **Chat Controller**: Gerenciamento de conversas e mensagens
- **Profile Settings**: Configuração de perfil e privacidade
- **Group Controller**: Administração completa de grupos
- **Settings**: Configurações gerais da instância
- **Websocket**: Comunicação em tempo real
- **Evolution Bot**: Sistema de webhook interno

---

## 📋 Índice

1. [📤 Send Message](#-send-message)
2. [💬 Chat Controller](#-chat-controller)
3. [👤 Profile Settings](#-profile-settings)
4. [👥 Group Controller](#-group-controller)
5. [⚙️ Settings](#️-settings)
6. [🔌 Websocket](#-websocket)
7. [🤖 Evolution Bot](#-evolution-bot)
8. [🔐 Autenticação](#-autenticação)
9. [📊 Códigos de Resposta](#-códigos-de-resposta)

---

## 📤 Send Message

### `POST /message/{instanceName}/sendText`
**Finalidade**: Envia mensagens de texto simples ou com formatação.

**Quando usar**:
- Mensagens de texto básicas
- Mensagens com formatação (negrito, itálico)
- Mensagens com menções
- Resposta a mensagens específicas

**Headers**:
```
Content-Type: application/json
apikey: sua-chave-api
```

**Body**:
```json
{
  "number": "5511999999999",
  "text": "*Olá!* Como posso ajudar você hoje?",
  "delay": 1000,
  "quoted": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "msg-id-original"
    },
    "message": {
      "conversation": "Mensagem original"
    }
  },
  "linkPreview": true,
  "mentioned": ["5511888888888"],
  "mentionsEveryOne": false
}
```

**Exemplo de Chamada**:
```bash
curl -X POST "https://localhost:8080/message/minha-instancia/sendText" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511999999999",
    "text": "🎉 *Bem-vindo!* \n\nSeu pedido foi confirmado. \n_Obrigado pela preferência!_",
    "linkPreview": true,
    "delay": 500
  }'
```

**Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": true,
      "id": "BAE5F4B6C7D8E9F0"
    },
    "message": {
      "conversation": "🎉 *Bem-vindo!* \n\nSeu pedido foi confirmado. \n_Obrigado pela preferência!_"
    },
    "messageTimestamp": "1696176000"
  }
}
```

---

### `POST /message/{instanceName}/sendMedia`
**Finalidade**: Envia arquivos de mídia (imagem, vídeo, documento, áudio).

**Quando usar**:
- Enviar fotos de produtos
- Compartilhar documentos
- Enviar vídeos promocionais
- Áudios personalizados

**Content-Type**: `multipart/form-data`

**Form Data**:
- `file`: Arquivo binário (opcional se usar URL)
- `number`: Número do destinatário
- `mediatype`: `image` | `video` | `document` | `audio`
- `caption`: Legenda (opcional)
- `fileName`: Nome do arquivo (para documentos)
- `media`: URL ou base64 (se não enviar arquivo)

**Exemplo de Chamada (Upload de Arquivo)**:
```bash
curl -X POST "https://localhost:8080/message/minha-instancia/sendMedia" \
  -H "apikey: BQYHJGJHJ" \
  -F "file=@/caminho/para/imagem.jpg" \
  -F "number=5511999999999" \
  -F "mediatype=image" \
  -F "caption=Nova coleção disponível! 🛍️"
```

**Exemplo de Chamada (URL)**:
```bash
curl -X POST "https://localhost:8080/message/minha-instancia/sendMedia" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511999999999",
    "mediatype": "image",
    "media": "https://example.com/imagem.jpg",
    "caption": "Confira nosso novo produto! 🎁"
  }'
```

**Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": true,
      "id": "BAE5F4B6C7D8E9F1"
    },
    "message": {
      "imageMessage": {
        "url": "https://mmg.whatsapp.net/...",
        "caption": "Nova coleção disponível! 🛍️",
        "mimetype": "image/jpeg"
      }
    }
  }
}
```

---

### `POST /message/{instanceName}/sendWhatsAppAudio`
**Finalidade**: Envia áudio como mensagem de voz do WhatsApp.

**Quando usar**:
- Mensagens pessoais em áudio
- Instruções faladas
- Atendimento humanizado

**Content-Type**: `multipart/form-data`

**Form Data**:
- `file`: Arquivo de áudio
- `number`: Número do destinatário

**Exemplo de Chamada**:
```bash
curl -X POST "https://localhost:8080/message/minha-instancia/sendWhatsAppAudio" \
  -H "apikey: BQYHJGJHJ" \
  -F "file=@audio-mensagem.mp3" \
  -F "number=5511999999999"
```

---

### `POST /message/{instanceName}/sendSticker`
**Finalidade**: Envia stickers (figurinhas).

**Exemplo de Chamada**:
```bash
curl -X POST "https://localhost:8080/message/minha-instancia/sendSticker" \
  -H "apikey: BQYHJGJHJ" \
  -F "file=@sticker.webp" \
  -F "number=5511999999999"
```

---

### `POST /message/{instanceName}/sendLocation`
**Finalidade**: Envia localização geográfica.

**Body**:
```json
{
  "number": "5511999999999",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "name": "Escritório Principal",
  "address": "Av. Paulista, 1000 - São Paulo, SP"
}
```

**Exemplo de Chamada**:
```bash
curl -X POST "https://localhost:8080/message/minha-instancia/sendLocation" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511999999999",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "name": "Nossa Loja",
    "address": "Rua do Comércio, 123 - Centro"
  }'
```

---

### `POST /message/{instanceName}/sendContact`
**Finalidade**: Envia cartão de contato.

**Body**:
```json
{
  "number": "5511999999999",
  "contact": [
    {
      "fullName": "João Silva",
      "wuid": "5511888888888",
      "phoneNumber": "5511888888888",
      "organization": "Empresa XYZ",
      "email": "joao@empresa.com"
    }
  ]
}
```

**Exemplo de Chamada**:
```bash
curl -X POST "https://localhost:8080/message/minha-instancia/sendContact" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511999999999",
    "contact": [
      {
        "fullName": "Suporte Técnico",
        "wuid": "5511888888888",
        "phoneNumber": "5511888888888",
        "organization": "TechCorp"
      }
    ]
  }'
```

---

### `POST /message/{instanceName}/sendReaction`
**Finalidade**: Envia reaction (emoji) em uma mensagem.

**Body**:
```json
{
  "reactionMessage": {
    "reaction": "👍",
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "msg-id-para-reagir"
    }
  }
}
```

**Exemplo de Chamada**:
```bash
curl -X POST "https://localhost:8080/message/minha-instancia/sendReaction" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "reactionMessage": {
      "reaction": "❤️",
      "key": {
        "remoteJid": "5511999999999@s.whatsapp.net",
        "fromMe": false,
        "id": "BAE5F4B6C7D8E9F0"
      }
    }
  }'
```

---

### `POST /message/{instanceName}/sendPoll`
**Finalidade**: Envia enquete interativa.

**Body**:
```json
{
  "number": "5511999999999",
  "name": "Qual sua pizza favorita?",
  "selectableCount": 1,
  "values": [
    "🍕 Margherita",
    "🧀 Quatro Queijos",
    "🍖 Calabresa",
    "🍄 Portuguesa"
  ]
}
```

**Exemplo de Chamada**:
```bash
curl -X POST "https://localhost:8080/message/minha-instancia/sendPoll" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511999999999",
    "name": "Como você avalia nosso atendimento?",
    "selectableCount": 1,
    "values": ["⭐ Excelente", "👍 Bom", "👌 Regular", "👎 Ruim"]
  }'
```

---

### `POST /message/{instanceName}/sendList`
**Finalidade**: Envia menu de lista interativa.

**Body**:
```json
{
  "number": "5511999999999",
  "title": "📋 Menu Principal",
  "description": "Escolha uma das opções abaixo:",
  "buttonText": "Ver Opções",
  "footerText": "Empresa XYZ",
  "sections": [
    {
      "title": "🛍️ Produtos",
      "rows": [
        {
          "rowId": "produto_1",
          "title": "Camisetas",
          "description": "Diversos modelos e cores"
        },
        {
          "rowId": "produto_2",
          "title": "Calças",
          "description": "Jeans e sociais"
        }
      ]
    },
    {
      "title": "📞 Atendimento",
      "rows": [
        {
          "rowId": "suporte",
          "title": "Falar com Suporte",
          "description": "Atendimento humanizado"
        }
      ]
    }
  ]
}
```

---

### `POST /message/{instanceName}/sendButtons`
**Finalidade**: Envia mensagem com botões interativos.

**Body**:
```json
{
  "number": "5511999999999",
  "title": "🎉 Promoção Especial!",
  "description": "Aproveite nossa oferta imperdível",
  "footer": "Válido até 31/12/2025",
  "buttons": [
    {
      "buttonId": "promo_1",
      "buttonText": {
        "displayText": "🛒 Ver Produtos"
      },
      "type": "reply"
    },
    {
      "buttonId": "info",
      "buttonText": {
        "displayText": "ℹ️ Mais Informações"
      },
      "type": "reply"
    },
    {
      "buttonId": "contato",
      "buttonText": {
        "displayText": "📞 Falar Conosco"
      },
      "type": "reply"
    }
  ]
}
```

---

### `POST /message/{instanceName}/sendTemplate`
**Finalidade**: Envia template personalizado.

**Body**:
```json
{
  "number": "5511999999999",
  "template": {
    "name": "welcome_message",
    "language": "pt_BR",
    "components": [
      {
        "type": "header",
        "parameters": [
          {
            "type": "text",
            "text": "João Silva"
          }
        ]
      },
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "Premium"
          }
        ]
      }
    ]
  }
}
```

---

## 💬 Chat Controller

### `POST /chat/{instanceName}/whatsappNumbers`
**Finalidade**: Verifica se números estão registrados no WhatsApp.

**Body**:
```json
{
  "numbers": [
    "5511999999999",
    "5511888888888",
    "5511777777777"
  ]
}
```

**Exemplo de Chamada**:
```bash
curl -X POST "https://localhost:8080/chat/minha-instancia/whatsappNumbers" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "numbers": ["5511999999999", "5511888888888"]
  }'
```

**Resposta**:
```json
{
  "status": "SUCCESS",
  "response": [
    {
      "jid": "5511999999999@s.whatsapp.net",
      "exists": true,
      "number": "5511999999999"
    },
    {
      "jid": "5511888888888@s.whatsapp.net",
      "exists": false,
      "number": "5511888888888"
    }
  ]
}
```

---

### `POST /chat/{instanceName}/markMessageAsRead`
**Finalidade**: Marca mensagens como lidas.

**Body**:
```json
{
  "readMessages": [
    {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "msg-id-1"
    }
  ]
}
```

**Exemplo de Chamada**:
```bash
curl -X POST "https://localhost:8080/chat/minha-instancia/markMessageAsRead" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "readMessages": [
      {
        "remoteJid": "5511999999999@s.whatsapp.net",
        "fromMe": false,
        "id": "BAE5F4B6C7D8E9F0"
      }
    ]
  }'
```

---

### `POST /chat/{instanceName}/archiveChat`
**Finalidade**: Arquiva ou desarquiva conversas.

**Body**:
```json
{
  "archive": true,
  "lastMessage": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": true,
      "id": "msg-id"
    }
  }
}
```

---

### `POST /chat/{instanceName}/markChatUnread`
**Finalidade**: Marca conversa como não lida.

**Body**:
```json
{
  "chat": "5511999999999@s.whatsapp.net"
}
```

---

### `DELETE /chat/{instanceName}/deleteMessageForEveryone`
**Finalidade**: Deleta mensagem para todos.

**Body**:
```json
{
  "key": {
    "remoteJid": "5511999999999@s.whatsapp.net",
    "fromMe": true,
    "id": "BAE5F4B6C7D8E9F0"
  }
}
```

---

### `POST /chat/{instanceName}/fetchProfilePictureUrl`
**Finalidade**: Busca URL da foto de perfil.

**Body**:
```json
{
  "number": "5511999999999"
}
```

**Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "profilePictureUrl": "https://pps.whatsapp.net/v/t61.24694-24/..."
  }
}
```

---

### `POST /chat/{instanceName}/getBase64FromMediaMessage`
**Finalidade**: Converte mídia de mensagem para base64.

**Body**:
```json
{
  "message": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "msg-id"
    }
  },
  "convertToMp4": false
}
```

---

### `POST /chat/{instanceName}/updateMessage`
**Finalidade**: Edita mensagem enviada.

**Body**:
```json
{
  "number": "5511999999999",
  "text": "Mensagem editada",
  "key": {
    "remoteJid": "5511999999999@s.whatsapp.net",
    "fromMe": true,
    "id": "msg-id"
  }
}
```

---

### `POST /chat/{instanceName}/sendPresence`
**Finalidade**: Envia status de presença (digitando, gravando).

**Body**:
```json
{
  "number": "5511999999999",
  "presence": "composing",
  "delay": 3000
}
```

**Tipos de Presença**:
- `available`: Online
- `unavailable`: Offline
- `composing`: Digitando
- `recording`: Gravando áudio
- `paused`: Pausado

---

### `POST /chat/{instanceName}/updateBlockStatus`
**Finalidade**: Bloqueia ou desbloqueia contato.

**Body**:
```json
{
  "number": "5511999999999",
  "status": "block"
}
```

**Status**: `block` | `unblock`

---

### `POST /chat/{instanceName}/findContacts`
**Finalidade**: Busca contatos com filtros.

**Body**:
```json
{
  "where": {
    "owner": "minha-instancia"
  },
  "limit": 20,
  "offset": 0
}
```

**Resposta**:
```json
{
  "status": "SUCCESS",
  "response": [
    {
      "id": "5511999999999@s.whatsapp.net",
      "pushName": "João Silva",
      "profilePictureUrl": "https://...",
      "owner": "minha-instancia"
    }
  ]
}
```

---

### `POST /chat/{instanceName}/findMessages`
**Finalidade**: Busca mensagens com filtros.

**Body**:
```json
{
  "where": {
    "owner": "minha-instancia",
    "key.remoteJid": "5511999999999@s.whatsapp.net"
  },
  "limit": 50,
  "offset": 0
}
```

---

### `POST /chat/{instanceName}/findChats`
**Finalidade**: Busca conversas ativas.

**Body**:
```json
{
  "where": {
    "owner": "minha-instancia"
  },
  "limit": 20
}
```

---

## 👤 Profile Settings

### `POST /chat/{instanceName}/fetchProfile`
**Finalidade**: Busca perfil de um contato.

**Body**:
```json
{
  "number": "5511999999999"
}
```

**Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "wuid": "5511999999999",
    "name": "João Silva",
    "picture": "https://pps.whatsapp.net/...",
    "status": "Disponível para conversar",
    "isBusiness": false
  }
}
```

---

### `POST /chat/{instanceName}/fetchBusinessProfile`
**Finalidade**: Busca perfil comercial.

**Body**:
```json
{
  "number": "5511999999999"
}
```

---

### `POST /chat/{instanceName}/updateProfileName`
**Finalidade**: Atualiza nome do perfil.

**Body**:
```json
{
  "name": "Meu Novo Nome"
}
```

**Exemplo de Chamada**:
```bash
curl -X POST "https://localhost:8080/chat/minha-instancia/updateProfileName" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "name": "Empresa XYZ - Atendimento"
  }'
```

---

### `POST /chat/{instanceName}/updateProfileStatus`
**Finalidade**: Atualiza status do perfil.

**Body**:
```json
{
  "status": "Disponível para atendimento 24h"
}
```

---

### `POST /chat/{instanceName}/updateProfilePicture`
**Finalidade**: Atualiza foto do perfil.

**Body**:
```json
{
  "picture": "https://example.com/nova-foto.jpg"
}
```

**Ou usando base64**:
```json
{
  "picture": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

---

### `DELETE /chat/{instanceName}/removeProfilePicture`
**Finalidade**: Remove foto do perfil.

**Exemplo de Chamada**:
```bash
curl -X DELETE "https://localhost:8080/chat/minha-instancia/removeProfilePicture" \
  -H "apikey: BQYHJGJHJ"
```

---

### `GET /chat/{instanceName}/fetchPrivacySettings`
**Finalidade**: Consulta configurações de privacidade.

**Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "readreceipts": "all",
    "profile": "contacts",
    "status": "contacts",
    "online": "all",
    "last": "contacts",
    "groupadd": "contacts"
  }
}
```

---

### `POST /chat/{instanceName}/updatePrivacySettings`
**Finalidade**: Atualiza configurações de privacidade.

**Body**:
```json
{
  "privacySettings": {
    "readreceipts": "none",
    "profile": "contacts",
    "status": "contacts",
    "online": "nobody",
    "last": "nobody",
    "groupadd": "contacts"
  }
}
```

**Opções de Privacidade**:
- `all`: Todos
- `contacts`: Apenas contatos
- `contact_blacklist`: Contatos exceto bloqueados
- `none` / `nobody`: Ninguém

---

## 👥 Group Controller

### `POST /group/{instanceName}/create`
**Finalidade**: Cria novo grupo.

**Body**:
```json
{
  "subject": "Grupo de Trabalho",
  "description": "Discussões sobre projetos",
  "participants": [
    "5511999999999",
    "5511888888888"
  ],
  "promoteParticipants": false
}
```

**Exemplo de Chamada**:
```bash
curl -X POST "https://localhost:8080/group/minha-instancia/create" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "subject": "Equipe de Vendas",
    "description": "Grupo para coordenação de vendas",
    "participants": ["5511999999999", "5511888888888"]
  }'
```

**Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "groupJid": "120363123456789012@g.us",
    "subject": "Equipe de Vendas"
  }
}
```

---

### `POST /group/{instanceName}/updateGroupSubject`
**Finalidade**: Atualiza nome do grupo.

**Body**:
```json
{
  "groupJid": "120363123456789012@g.us",
  "subject": "Novo Nome do Grupo"
}
```

---

### `POST /group/{instanceName}/updateGroupDescription`
**Finalidade**: Atualiza descrição do grupo.

**Body**:
```json
{
  "groupJid": "120363123456789012@g.us",
  "description": "Nova descrição do grupo"
}
```

---

### `POST /group/{instanceName}/updateGroupPicture`
**Finalidade**: Atualiza foto do grupo.

**Body**:
```json
{
  "groupJid": "120363123456789012@g.us",
  "image": "https://example.com/nova-foto-grupo.jpg"
}
```

---

### `GET /group/{instanceName}/findGroupInfos`
**Finalidade**: Busca informações do grupo.

**Query Params**:
- `groupJid`: ID do grupo

**Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "id": "120363123456789012@g.us",
    "subject": "Equipe de Vendas",
    "subjectOwner": "5511999999999@s.whatsapp.net",
    "subjectTime": 1696176000,
    "creation": 1696175000,
    "owner": "5511999999999@s.whatsapp.net",
    "description": "Grupo para coordenação de vendas",
    "restrict": false,
    "announce": false,
    "size": 15,
    "participants": [
      {
        "id": "5511999999999@s.whatsapp.net",
        "admin": "admin"
      }
    ]
  }
}
```

---

### `GET /group/{instanceName}/fetchAllGroups`
**Finalidade**: Lista todos os grupos.

**Query Params**:
- `getParticipants`: `true` | `false` (incluir participantes)

**Exemplo de Chamada**:
```bash
curl "https://localhost:8080/group/minha-instancia/fetchAllGroups?getParticipants=true" \
  -H "apikey: BQYHJGJHJ"
```

---

### `GET /group/{instanceName}/participants`
**Finalidade**: Lista participantes do grupo.

**Query Params**:
- `groupJid`: ID do grupo

**Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "participants": [
      {
        "id": "5511999999999@s.whatsapp.net",
        "admin": "admin"
      },
      {
        "id": "5511888888888@s.whatsapp.net",
        "admin": null
      }
    ]
  }
}
```

---

### `GET /group/{instanceName}/inviteCode`
**Finalidade**: Gera código de convite do grupo.

**Query Params**:
- `groupJid`: ID do grupo

**Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "inviteCode": "EhXLxvxGL7f6XjALEhZVPj"
  }
}
```

---

### `GET /group/{instanceName}/inviteInfo`
**Finalidade**: Busca informações de um convite.

**Query Params**:
- `inviteCode`: Código do convite

**Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "id": "120363123456789012@g.us",
    "subject": "Grupo Público",
    "creator": "5511999999999@s.whatsapp.net",
    "creation": 1696176000,
    "size": 25,
    "description": "Grupo aberto para discussões"
  }
}
```

---

### `GET /group/{instanceName}/acceptInviteCode`
**Finalidade**: Aceita convite de grupo.

**Query Params**:
- `inviteCode`: Código do convite

---

### `POST /group/{instanceName}/sendInvite`
**Finalidade**: Envia convite do grupo via mensagem.

**Body**:
```json
{
  "groupJid": "120363123456789012@g.us",
  "numbers": [
    "5511999999999",
    "5511888888888"
  ],
  "inviteMessage": "Venha participar do nosso grupo!"
}
```

---

### `POST /group/{instanceName}/revokeInviteCode`
**Finalidade**: Revoga código de convite atual.

**Body**:
```json
{
  "groupJid": "120363123456789012@g.us"
}
```

---

### `POST /group/{instanceName}/updateParticipant`
**Finalidade**: Adiciona, remove ou promove participantes.

**Body**:
```json
{
  "groupJid": "120363123456789012@g.us",
  "action": "add",
  "participants": [
    "5511999999999",
    "5511888888888"
  ]
}
```

**Ações Disponíveis**:
- `add`: Adicionar participantes
- `remove`: Remover participantes
- `promote`: Promover a admin
- `demote`: Rebaixar admin

---

### `POST /group/{instanceName}/updateSetting`
**Finalidade**: Atualiza configurações do grupo.

**Body**:
```json
{
  "groupJid": "120363123456789012@g.us",
  "action": "announcement",
  "restrict": true
}
```

**Configurações**:
- `announcement`: Apenas admins podem enviar mensagens
- `not_announcement`: Todos podem enviar mensagens
- `restrict`: Apenas admins podem editar info do grupo
- `not_restrict`: Todos podem editar info do grupo

---

### `POST /group/{instanceName}/toggleEphemeral`
**Finalidade**: Ativa/desativa mensagens temporárias.

**Body**:
```json
{
  "groupJid": "120363123456789012@g.us",
  "ephemeralExpiration": 86400
}
```

**Durações**:
- `0`: Desabilitar
- `86400`: 1 dia
- `604800`: 7 dias
- `2592000`: 30 dias

---

### `DELETE /group/{instanceName}/leaveGroup`
**Finalidade**: Sair do grupo.

**Body**:
```json
{
  "groupJid": "120363123456789012@g.us"
}
```

---

## ⚙️ Settings

### `POST /settings/{instanceName}/set`
**Finalidade**: Configura parâmetros gerais da instância.

**Quando usar**:
- Configurar comportamento da instância
- Definir parâmetros de funcionamento
- Personalizar configurações específicas

**Body**:
```json
{
  "reject_call": false,
  "msg_call": "Não estamos atendendo chamadas no momento. Envie uma mensagem!",
  "groups_ignore": true,
  "always_online": false,
  "read_messages": true,
  "read_status": false,
  "sync_full_history": true
}
```

**Exemplo de Chamada**:
```bash
curl -X POST "https://localhost:8080/settings/minha-instancia/set" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "reject_call": true,
    "msg_call": "📞 Não atendemos chamadas. Por favor, envie uma mensagem de texto!",
    "groups_ignore": false,
    "always_online": true,
    "read_messages": true,
    "read_status": true,
    "sync_full_history": false
  }'
```

**Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "reject_call": true,
    "msg_call": "📞 Não atendemos chamadas. Por favor, envie uma mensagem de texto!",
    "groups_ignore": false,
    "always_online": true,
    "read_messages": true,
    "read_status": true,
    "sync_full_history": false,
    "updatedAt": "2025-10-01T15:30:00.000Z"
  }
}
```

**Parâmetros Disponíveis**:
- `reject_call`: Rejeitar chamadas automaticamente
- `msg_call`: Mensagem enviada quando rejeitar chamada
- `groups_ignore`: Ignorar mensagens de grupos
- `always_online`: Manter sempre online
- `read_messages`: Marcar mensagens como lidas automaticamente
- `read_status`: Marcar status como lidos
- `sync_full_history`: Sincronizar histórico completo

---

### `GET /settings/{instanceName}/find`
**Finalidade**: Consulta configurações atuais da instância.

**Quando usar**:
- Verificar configurações ativas
- Auditoria de parâmetros
- Validar configurações aplicadas

**Exemplo de Chamada**:
```bash
curl "https://localhost:8080/settings/minha-instancia/find" \
  -H "apikey: BQYHJGJHJ"
```

**Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "reject_call": true,
    "msg_call": "📞 Não atendemos chamadas. Por favor, envie uma mensagem de texto!",
    "groups_ignore": false,
    "always_online": true,
    "read_messages": true,
    "read_status": true,
    "sync_full_history": false,
    "instanceName": "minha-instancia",
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-10-01T15:30:00.000Z"
  }
}
```

**Resposta (Configurações Padrão)**:
```json
{
  "status": "SUCCESS",
  "response": {
    "reject_call": false,
    "msg_call": "",
    "groups_ignore": true,
    "always_online": false,
    "read_messages": true,
    "read_status": false,
    "sync_full_history": true,
    "instanceName": "minha-instancia",
    "note": "Using default settings"
  }
}
```

### **Casos de Uso Práticos**

**Bot de Atendimento Comercial**:
```json
{
  "reject_call": true,
  "msg_call": "🤖 Nosso atendimento é apenas por mensagem de texto. Como posso ajudar?",
  "groups_ignore": true,
  "always_online": true,
  "read_messages": true,
  "read_status": false,
  "sync_full_history": false
}
```

**Suporte Técnico**:
```json
{
  "reject_call": false,
  "groups_ignore": false,
  "always_online": true,
  "read_messages": true,
  "read_status": true,
  "sync_full_history": true
}
```

**Bot de Notificações**:
```json
{
  "reject_call": true,
  "msg_call": "📢 Esta é uma conta apenas para notificações. Não respondemos mensagens.",
  "groups_ignore": true,
  "always_online": false,
  "read_messages": false,
  "read_status": false,
  "sync_full_history": false
}
```

---

## 🔌 Websocket

### `POST /websocket/{instanceName}/set`
**Finalidade**: Configura conexão websocket para eventos em tempo real.

**Body**:
```json
{
  "enabled": true,
  "events": [
    "MESSAGES_UPSERT",
    "MESSAGES_UPDATE",
    "PRESENCE_UPDATE",
    "CHATS_UPSERT",
    "CHATS_UPDATE",
    "CONTACTS_UPSERT",
    "CONTACTS_UPDATE"
  ]
}
```

**Exemplo de Chamada**:
```bash
curl -X POST "https://localhost:8080/websocket/minha-instancia/set" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "enabled": true,
    "events": ["MESSAGES_UPSERT", "PRESENCE_UPDATE"]
  }'
```

**Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "enabled": true,
    "events": ["MESSAGES_UPSERT", "PRESENCE_UPDATE"]
  }
}
```

---

### `GET /websocket/{instanceName}/find`
**Finalidade**: Consulta configuração atual do websocket.

**Resposta**:
```json
{
  "status": "SUCCESS",
  "response": {
    "enabled": true,
    "events": ["MESSAGES_UPSERT", "PRESENCE_UPDATE"],
    "url": "ws://localhost:8080/websocket/minha-instancia"
  }
}
```

---

### **Como conectar ao Websocket**

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080/websocket/minha-instancia');

ws.on('open', function open() {
  console.log('✅ Conectado ao websocket');
});

ws.on('message', function message(data) {
  const event = JSON.parse(data);
  console.log('📨 Evento recebido:', event);

  switch(event.event) {
    case 'MESSAGES_UPSERT':
      console.log('💬 Nova mensagem:', event.data);
      break;
    case 'PRESENCE_UPDATE':
      console.log('👁️ Presença atualizada:', event.data);
      break;
  }
});

ws.on('close', function close() {
  console.log('❌ Websocket desconectado');
});
```

---

### **Eventos Websocket Disponíveis**

- `MESSAGES_UPSERT`: Novas mensagens recebidas
- `MESSAGES_UPDATE`: Atualizações de mensagem (lida, entregue)
- `PRESENCE_UPDATE`: Mudanças de presença (online, offline)
- `CHATS_UPSERT`: Novos chats criados
- `CHATS_UPDATE`: Atualizações de chat
- `CONTACTS_UPSERT`: Novos contatos
- `CONTACTS_UPDATE`: Atualizações de contatos
- `CONNECTION_UPDATE`: Mudanças na conexão

---

## 🤖 Evolution Bot

### `POST /webhook/evolution`
**Finalidade**: Recebe webhooks internos do sistema Evolution.

**Quando usar**:
- Integração entre instâncias Evolution
- Sistema de relay de webhooks
- Processamento centralizado de eventos

**Body**: Payload padrão do Evolution API

**Exemplo de Webhook Interno**:
```json
{
  "event": "messages.upsert",
  "instance": "instancia-origem",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "msg-123"
    },
    "message": {
      "conversation": "Olá!"
    }
  },
  "server_url": "https://evolution-origem.com",
  "apikey": "origem-api-key"
}
```

**Resposta**:
```json
{
  "status": "SUCCESS",
  "message": "Webhook processed successfully"
}
```

---

## 🔐 Autenticação

Todos os endpoints requerem autenticação via header `apikey`:

```
apikey: sua-chave-api
```

### Configuração da API Key

```env
AUTHENTICATION_API_KEY_KEY=sua-chave-super-secreta
```

### Testando Autenticação

```bash
curl "https://localhost:8080/verify-creds" \
  -H "apikey: BQYHJGJHJ"
```

---

## 📊 Códigos de Resposta

### Estrutura Padrão de Resposta

**Sucesso**:
```json
{
  "status": "SUCCESS",
  "response": {
    // dados da resposta
  }
}
```

**Erro**:
```json
{
  "status": "ERROR",
  "error": true,
  "response": {
    "message": "Descrição do erro"
  }
}
```

### Códigos HTTP

| Código | Status | Descrição |
|--------|--------|-----------|
| 200 | OK | Operação realizada com sucesso |
| 201 | Created | Recurso criado (mensagem enviada) |
| 400 | Bad Request | Dados inválidos |
| 401 | Unauthorized | API key inválida |
| 403 | Forbidden | Acesso negado |
| 404 | Not Found | Instância não encontrada |
| 500 | Internal Server Error | Erro interno |

---

## 🎯 Exemplos de Uso Prático

### Bot de Atendimento Completo

```bash
# 1. Enviar boas-vindas
curl -X POST "https://localhost:8080/message/atendimento/sendText" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511999999999",
    "text": "👋 Olá! Bem-vindo ao nosso atendimento.\n\nComo posso ajudar você hoje?"
  }'

# 2. Enviar menu de opções
curl -X POST "https://localhost:8080/message/atendimento/sendButtons" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511999999999",
    "title": "📋 Menu de Atendimento",
    "description": "Escolha uma das opções:",
    "buttons": [
      {
        "buttonId": "produtos",
        "buttonText": {"displayText": "🛍️ Ver Produtos"},
        "type": "reply"
      },
      {
        "buttonId": "suporte",
        "buttonText": {"displayText": "🔧 Suporte Técnico"},
        "type": "reply"
      },
      {
        "buttonId": "vendas",
        "buttonText": {"displayText": "💼 Falar com Vendas"},
        "type": "reply"
      }
    ]
  }'

# 3. Marcar mensagem como lida
curl -X POST "https://localhost:8080/chat/atendimento/markMessageAsRead" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "readMessages": [{
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "msg-cliente-123"
    }]
  }'

# 4. Mostrar que está digitando
curl -X POST "https://localhost:8080/chat/atendimento/sendPresence" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511999999999",
    "presence": "composing",
    "delay": 2000
  }'
```

### E-commerce com Catálogo

```bash
# 1. Enviar catálogo de produtos
curl -X POST "https://localhost:8080/message/loja/sendList" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511999999999",
    "title": "🛍️ Nossos Produtos",
    "description": "Confira nossa seleção especial:",
    "buttonText": "Ver Produtos",
    "sections": [
      {
        "title": "👕 Roupas",
        "rows": [
          {
            "rowId": "camiseta_1",
            "title": "Camiseta Básica",
            "description": "R$ 29,90 - Várias cores"
          },
          {
            "rowId": "calca_1",
            "title": "Calça Jeans",
            "description": "R$ 89,90 - Tamanhos P ao GG"
          }
        ]
      }
    ]
  }'

# 2. Enviar imagem do produto
curl -X POST "https://localhost:8080/message/loja/sendMedia" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511999999999",
    "mediatype": "image",
    "media": "https://loja.com/produtos/camiseta-basica.jpg",
    "caption": "👕 *Camiseta Básica* \n\n💰 *R$ 29,90* \n✅ Disponível nas cores: Branco, Preto, Azul \n📏 Tamanhos: P, M, G, GG \n\n🚚 *Frete Grátis* para sua região!"
  }'

# 3. Criar enquete para feedback
curl -X POST "https://localhost:8080/message/loja/sendPoll" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511999999999",
    "name": "Como você avalia nossos produtos?",
    "selectableCount": 1,
    "values": ["⭐⭐⭐⭐⭐ Excelente", "⭐⭐⭐⭐ Muito Bom", "⭐⭐⭐ Bom", "⭐⭐ Regular"]
  }'
```

---

## 🔄 Integrações Avançadas

### Sistema de Notificações

```bash
# Enviar notificação com localização
curl -X POST "https://localhost:8080/message/delivery/sendLocation" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "number": "5511999999999",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "name": "Seu pedido chegou!",
    "address": "Entregador está na sua porta"
  }'
```

### Grupo de Suporte

```bash
# Criar grupo de suporte
curl -X POST "https://localhost:8080/group/suporte/create" \
  -H "Content-Type: application/json" \
  -H "apikey: BQYHJGJHJ" \
  -d '{
    "subject": "Suporte - Cliente VIP",
    "description": "Atendimento especializado para clientes VIP",
    "participants": ["5511999999999", "5511888888888"]
  }'
```

---

**Versão da Documentação**: Evolution API Lite 2.2.1
**Última Atualização**: 2025-10-01
**Suporte**: Para dúvidas sobre a API Evolution original, consulte https://doc.evolution-api.com