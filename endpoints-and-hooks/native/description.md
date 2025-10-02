# Evolution API - Documentação Completa dos Endpoints

## 1. API Status

### GET / - Status da API
```bash
curl --request GET \
  --url https://{server-url}/
```

**Resposta:**
```json
{
  "status": 200,
  "message": "Welcome to the Evolution API, it is working!",
  "version": "1.7.4",
  "swagger": "http://example.evolution-api.com/docs",
  "manager": "http://example.evolution-api.com/manager",
  "documentation": "https://doc.evolution-api.com"
}
```

## 2. Settings Controller

### POST /settings/set/{instance} - Configurar Instância
```bash
curl --request POST \
  --url https://{server-url}/settings/set/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "rejectCall": true,
  "msgCall": "<string>",
  "groupsIgnore": true,
  "alwaysOnline": true,
  "readMessages": true,
  "readStatus": true,
  "syncFullHistory": true
}'
```

**Resposta:**
```json
{
  "settings": {
    "instanceName": "teste-docs",
    "settings": {
      "reject_call": true,
      "groups_ignore": true,
      "always_online": true,
      "read_messages": true,
      "read_status": true,
      "sync_full_history": false
    }
  }
}
```

### GET /settings/find/{instance} - Buscar Configurações
```bash
curl --request GET \
  --url https://{server-url}/settings/find/{instance} \
  --header 'apikey: <api-key>'
```

**Resposta:**
```json
{
  "reject_call": true,
  "groups_ignore": true,
  "always_online": true,
  "read_messages": true,
  "read_status": true,
  "sync_full_history": false
}
```

## 3. Message Controller

### 3.1 Envio de Texto

#### POST /message/sendText/{instance} - Enviar Texto
```bash
curl --request POST \
  --url https://{server-url}/message/sendText/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "number": "<string>",
  "text": "<string>",
  "delay": 123,
  "linkPreview": true,
  "mentionsEveryOne": true,
  "mentioned": [
    "{{remoteJID}}"
  ],
  "quoted": {
    "key": {
      "id": "<string>"
    },
    "message": {
      "conversation": "<string>"
    }
  }
}'
```

**Resposta:**
```json
{
  "key": {
    "remoteJid": "553198296801@s.whatsapp.net",
    "fromMe": true,
    "id": "BAE594145F4C59B4"
  },
  "message": {
    "extendedTextMessage": {
      "text": "Olá!"
    }
  },
  "messageTimestamp": "1717689097",
  "status": "PENDING"
}
```

### 3.2 Status

#### POST /message/sendStatus/{instance} - Enviar Status
```bash
curl --request POST \
  --url https://{server-url}/message/sendStatus/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "type": "text",
  "content": "<string>",
  "caption": "<string>",
  "backgroundColor": "<string>",
  "font": 123,
  "allContacts": true,
  "statusJidList": [
    "{{remoteJID}}"
  ]
}'
```

**Resposta:**
```json
{
  "key": {
    "remoteJid": "status@broadcast",
    "fromMe": true,
    "id": "BAE5FAB9E65A3DA8"
  },
  "message": {
    "extendedTextMessage": {
      "text": "example",
      "backgroundArgb": 4294910617,
      "font": "FB_SCRIPT"
    }
  },
  "messageTimestamp": "1717691767",
  "status": "PENDING",
  "participant": "553198296801:17@s.whatsapp.net"
}
```

### 3.3 Mídia

#### POST /message/sendMedia/{instance} - Enviar Mídia
```bash
curl --request POST \
  --url https://{server-url}/message/sendMedia/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "number": "<string>",
  "mediatype": "<string>",
  "mimetype": "<string>",
  "caption": "<string>",
  "media": "<string>",
  "fileName": "<string>",
  "delay": 123,
  "linkPreview": true,
  "mentionsEveryOne": true,
  "mentioned": [
    "{{remoteJID}}"
  ],
  "quoted": {
    "key": {
      "id": "<string>"
    },
    "message": {
      "conversation": "<string>"
    }
  }
}'
```

**Resposta:**
```json
{
  "key": {
    "remoteJid": "553198296801@s.whatsapp.net",
    "fromMe": true,
    "id": "BAE5F5A632EAE722"
  },
  "message": {
    "imageMessage": {
      "url": "https://mmg.whatsapp.net/o1/v/t62.7118-2...",
      "mimetype": "image/png",
      "caption": "Caption text",
      "fileSha256": "VbCGkGBv5SZStLD5PHdkBWpQav/lNsXcY...",
      "fileLength": "1305757",
      "height": 1080,
      "width": 1920,
      "mediaKey": "aFQK9Ocw5tE7Nf0iBA42Xcb4Dee6G1k/pLL...",
      "fileEncSha256": "bGVtYeR3458RwC0p1tsGDNuj+vOu/...",
      "directPath": "/o1/v/t62.7118-24/f1/m232/up-oil...",
      "mediaKeyTimestamp": "1717775573",
      "jpegThumbnail": "/9j/2wBDABALDA4MChAODQ4SERATG...",
      "contextInfo": {}
    }
  },
  "messageTimestamp": "1717775575",
  "status": "PENDING"
}
```

### 3.4 Áudio

#### POST /message/sendWhatsAppAudio/{instance} - Enviar Áudio
```bash
curl --request POST \
  --url https://{server-url}/message/sendWhatsAppAudio/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "number": "<string>",
  "audio": "<string>",
  "delay": 123,
  "linkPreview": true,
  "mentionsEveryOne": true,
  "mentioned": [
    "{{remoteJID}}"
  ],
  "quoted": {
    "key": {
      "id": "<string>"
    },
    "message": {
      "conversation": "<string>"
    }
  }
}'
```

**Resposta:**
```json
{
  "key": {
    "remoteJid": "553198296801@s.whatsapp.net",
    "fromMe": true,
    "id": "BAE5EFED2AB0BB9F"
  },
  "message": {
    "audioMessage": {
      "url": "https://mmg.whatsapp.net/v/t62.7114-24/21428511_985284763127087_5662928...",
      "mimetype": "audio/mp4",
      "fileSha256": "DJPBnRns6QADzZNH2j0R88mUtFQ4aiOm9aZf6dio2G0=",
      "fileLength": "670662",
      "seconds": 42,
      "ptt": true,
      "mediaKey": "+A3X1Tuyzeh87cCVZpfuKpL3Y4RYdYr3sCDurjSlBTY=",
      "fileEncSha256": "s4tKvHOXIZAw5668/Xcy4zoFba4vW8klmNYC78yOPZs=",
      "directPath": "/v/t62.7114-24/21428511_985284763127087_5662928477636351284_n.enc...",
      "mediaKeyTimestamp": "1717776942"
    }
  },
  "messageTimestamp": "1717776942",
  "status": "PENDING"
}
```

### 3.5 Sticker

#### POST /message/sendSticker/{instance} - Enviar Sticker
```bash
curl --request POST \
  --url https://{server-url}/message/sendSticker/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "number": "<string>",
  "sticker": "<string>",
  "delay": 123,
  "linkPreview": true,
  "mentionsEveryOne": true,
  "mentioned": [
    "{{remoteJID}}"
  ],
  "quoted": {
    "key": {
      "id": "<string>"
    },
    "message": {
      "conversation": "<string>"
    }
  }
}'
```

### 3.6 Localização

#### POST /message/sendLocation/{instance} - Enviar Localização
```bash
curl --request POST \
  --url https://{server-url}/message/sendLocation/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "number": "<string>",
  "name": "<string>",
  "address": "<string>",
  "latitude": 123,
  "longitude": 123,
  "delay": 123,
  "linkPreview": true,
  "mentionsEveryOne": true,
  "mentioned": [
    "{{remoteJID}}"
  ],
  "quoted": {
    "key": {
      "id": "<string>"
    },
    "message": {
      "conversation": "<string>"
    }
  }
}'
```

**Resposta:**
```json
{
  "key": {
    "remoteJid": "553198296801@s.whatsapp.net",
    "fromMe": true,
    "id": "BAE51B6FF4470AF9"
  },
  "message": {
    "locationMessage": {
      "degreesLatitude": -19.93359,
      "degreesLongitude": -43.93851,
      "name": "Palácio da Liberdade",
      "address": "Praça da Liberdade, Belo Horizonte, MG 30140-050",
      "contextInfo": {}
    }
  },
  "messageTimestamp": "1717779606",
  "status": "PENDING"
}
```

### 3.7 Contato

#### POST /message/sendContact/{instance} - Enviar Contato
```bash
curl --request POST \
  --url https://{server-url}/message/sendContact/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "number": "<string>",
  "contact": [
    {
      "fullName": "<string>",
      "wuid": "<string>",
      "phoneNumber": "<string>",
      "organization": "<string>",
      "email": "<string>",
      "url": "<string>"
    }
  ]
}'
```

**Resposta:**
```json
{
  "key": {
    "remoteJid": "553198296801@s.whatsapp.net",
    "fromMe": true,
    "id": "BAE58DA6CBC941BC"
  },
  "message": {
    "contactMessage": {
      "displayName": "Guilherme Gomes",
      "vcard": "BEGIN:VCARD\nVERSION:3.0\nN:Guilherme Gomes\nFN:Guilherme Gomes\nORG:AtendAI;\nEMAIL:...",
      "contextInfo": {}
    }
  },
  "messageTimestamp": "1717780437",
  "status": "PENDING"
}
```

### 3.8 Reação

#### POST /message/sendReaction/{instance} - Enviar Reação
```bash
curl --request POST \
  --url https://{server-url}/message/sendReaction/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "key": {
    "remoteJid": "<string>",
    "fromMe": true,
    "id": "<string>"
  },
  "reaction": "🚀"
}'
```

**Resposta:**
```json
{
  "key": {
    "remoteJid": "553198296801@s.whatsapp.net",
    "fromMe": true,
    "id": "BAE569F0E38F858D"
  },
  "message": {
    "reactionMessage": {
      "key": {
        "remoteJid": "553198296801@s.whatsapp.net",
        "fromMe": true,
        "id": "BAE58DA6CBC941BC"
      },
      "text": "🚀",
      "senderTimestampMs": "1717781105034"
    }
  },
  "messageTimestamp": "1717781105",
  "status": "PENDING"
}
```

### 3.9 Enquete

#### POST /message/sendPoll/{instance} - Enviar Enquete
```bash
curl --request POST \
  --url https://{server-url}/message/sendPoll/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "number": "<string>",
  "name": "<string>",
  "selectableCount": 123,
  "values": [
    "Question 1"
  ],
  "delay": 123,
  "linkPreview": true,
  "mentionsEveryOne": true,
  "mentioned": [
    "{{remoteJID}}"
  ],
  "quoted": {
    "key": {
      "id": "<string>"
    },
    "message": {
      "conversation": "<string>"
    }
  }
}'
```

**Resposta:**
```json
{
  "key": {
    "remoteJid": "553198296801@s.whatsapp.net",
    "fromMe": true,
    "id": "BAE53EC8D8E1FD8A"
  },
  "message": {
    "messageContextInfo": {
      "messageSecret": "lX/+cLHHNfnTTKZi+88mrhoyi6KNuUzWjgfaB0bTfOY="
    },
    "pollCreationMessage": {
      "name": "Poll Name",
      "options": [
        {
          "optionName": "Option 1"
        },
        {
          "optionName": "Option 2"
        },
        {
          "optionName": "Option 3"
        }
      ],
      "selectableOptionsCount": 1
    }
  },
  "messageTimestamp": "1717781848",
  "status": "PENDING"
}
```

### 3.10 Lista

#### POST /message/sendList/{instance} - Enviar Lista
```bash
curl --request POST \
  --url https://{server-url}/message/sendList/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "number": "<string>",
  "title": "<string>",
  "description": "<string>",
  "buttonText": "<string>",
  "footerText": "<string>",
  "values": [
    {
      "title": "<string>",
      "rows": [
        {
          "title": "<string>",
          "description": "<string>",
          "rowId": "<string>"
        }
      ]
    }
  ],
  "delay": 123,
  "linkPreview": true,
  "mentionsEveryOne": true,
  "mentioned": [
    "{{remoteJID}}"
  ],
  "quoted": {
    "key": {
      "id": "<string>"
    },
    "message": {
      "conversation": "<string>"
    }
  }
}'
```

### 3.11 Botões

#### POST /message/sendButtons/{instance} - Enviar Botões
```bash
curl --request POST \
  --url https://{server-url}/message/sendButtons/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "number": "<string>",
  "title": "<string>",
  "description": "<string>",
  "footer": "<string>",
  "buttons": [
    {
      "title": "<string>",
      "displayText": "<string>",
      "id": "<string>"
    }
  ],
  "delay": 123,
  "linkPreview": true,
  "mentionsEveryOne": true,
  "mentioned": [
    "{{remoteJID}}"
  ],
  "quoted": {
    "key": {
      "id": "<string>"
    },
    "message": {
      "conversation": "<string>"
    }
  }
}'
```

## 4. Chat Controller

### 4.1 Verificação de Números

#### POST /chat/whatsappNumbers/{instance} - Verificar Números WhatsApp
```bash
curl --request POST \
  --url https://{server-url}/chat/whatsappNumbers/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "numbers": [
    "<string>"
  ]
}'
```

**Resposta:**
```json
[
  {
    "exists": true,
    "jid": "553198296801@s.whatsapp.net",
    "number": "553198296801"
  }
]
```

### 4.2 Gerenciamento de Mensagens

#### POST /chat/markMessageAsRead/{instance} - Marcar como Lida
```bash
curl --request POST \
  --url https://{server-url}/chat/markMessageAsRead/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "readMessages": [
    {
      "remoteJid": "<string>",
      "fromMe": true,
      "id": "<string>"
    }
  ]
}'
```

**Resposta:**
```json
{
  "message": "Read messages",
  "read": "success"
}
```

#### POST /chat/markChatUnread/{instance} - Marcar Chat como Não Lido
```bash
curl --request POST \
  --url https://{server-url}/chat/markChatUnread/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "lastMessage": [
    {
      "remoteJid": "<string>",
      "fromMe": true,
      "id": "<string>"
    }
  ],
  "chat": "<string>"
}'
```

**Resposta:**
```json
{
  "message": "Read messages",
  "read": "success"
}
```

#### POST /chat/archiveChat/{instance} - Arquivar Chat
```bash
curl --request POST \
  --url https://{server-url}/chat/archiveChat/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "lastMessage": {
    "key": {
      "remoteJid": "<string>",
      "fromMe": true,
      "id": "<string>"
    }
  },
  "archive": true,
  "chat": "<string>"
}'
```

**Resposta:**
```json
{
  "chatId": "553198296801@s.whatsapp.net",
  "archived": true
}
```

#### DELETE /chat/deleteMessageForEveryone/{instance} - Apagar Mensagem
```bash
curl --request DELETE \
  --url https://{server-url}/chat/deleteMessageForEveryone/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "id": "<string>",
  "remoteJid": "<string>",
  "fromMe": true,
  "participant": "<string>"
}'
```

**Resposta:**
```json
{
  "key": {
    "remoteJid": "553198296801@s.whatsapp.com",
    "fromMe": true,
    "id": "BAE5EABBD912C4E2"
  },
  "message": {
    "protocolMessage": {
      "key": {
        "remoteJid": "553198296801@s.whatsapp.com",
        "fromMe": true,
        "id": "BAE52B567D0E3DD8"
      },
      "type": "REVOKE"
    }
  },
  "messageTimestamp": "1718108455",
  "status": "PENDING"
}
```

#### POST /chat/updateMessage/{instance} - Atualizar Mensagem
```bash
curl --request POST \
  --url https://{server-url}/chat/updateMessage/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "number": 123,
  "text": "<string>",
  "key": {
    "remoteJid": "<string>",
    "fromMe": true,
    "id": "<string>"
  }
}'
```

### 4.3 Presença e Status

#### POST /chat/sendPresence/{instance} - Enviar Presença
```bash
curl --request POST \
  --url https://{server-url}/chat/sendPresence/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "number": "<string>",
  "options": {
    "delay": 123,
    "presence": "composing",
    "number": "<string>"
  }
}'
```

#### POST /message/updateBlockStatus/{instance} - Status de Bloqueio
```bash
curl --request POST \
  --url https://{server-url}/message/updateBlockStatus/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "number": "<string>",
  "status": "<string>"
}'
```

### 4.4 Perfil e Mídia

#### POST /chat/fetchProfilePictureUrl/{instance} - Buscar Foto de Perfil
```bash
curl --request POST \
  --url https://{server-url}/chat/fetchProfilePictureUrl/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "number": "<string>"
}'
```

**Resposta:**
```json
{
  "wuid": "553198296801@s.whatsapp.net",
  "profilePictureUrl": "https://pps.whatsapp.net/v/t61.2..."
}
```

#### POST /chat/getBase64FromMediaMessage/{instance} - Obter Base64 de Mídia
```bash
curl --request POST \
  --url https://{server-url}/chat/getBase64FromMediaMessage/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "message": {
    "key": {
      "id": "<string>"
    }
  },
  "convertToMp4": true
}'
```

### 4.5 Busca e Consultas

#### POST /chat/findContacts/{instance} - Buscar Contatos
```bash
curl --request POST \
  --url https://{server-url}/chat/findContacts/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "where": {
    "id": "<string>"
  }
}'
```

#### POST /chat/findMessages/{instance} - Buscar Mensagens
```bash
curl --request POST \
  --url https://{server-url}/chat/findMessages/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "where": {
    "key": {
      "remoteJid": "<string>"
    }
  }
}'
```

#### POST /chat/findStatusMessage/{instance} - Buscar Mensagens de Status
```bash
curl --request POST \
  --url https://{server-url}/chat/findStatusMessage/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "where": {
    "_id": "<string>",
    "id": "<string>",
    "remoteJid": "<string>",
    "fromMe": true
  },
  "limit": 123
}'
```

#### POST /chat/findChats/{instance} - Buscar Chats
```bash
curl --request POST \
  --url https://{server-url}/chat/findChats/{instance} \
  --header 'apikey: <api-key>'
```

### 4.6 Perfil de Negócios

#### POST /chat/fetchBusinessProfile/{instance} - Buscar Perfil Comercial
```bash
curl --request POST \
  --url https://{server-url}/chat/fetchBusinessProfile/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "number": "<string>"
}'
```

#### POST /chat/fetchProfile/{instance} - Buscar Perfil
```bash
curl --request POST \
  --url https://{server-url}/chat/fetchProfile/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "number": "<string>"
}'
```

### 4.7 Atualização de Perfil

#### POST /chat/updateProfileName/{instance} - Atualizar Nome do Perfil
```bash
curl --request POST \
  --url https://{server-url}/chat/updateProfileName/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "name": "<string>"
}'
```

#### POST /chat/updateProfileStatus/{instance} - Atualizar Status do Perfil
```bash
curl --request POST \
  --url https://{server-url}/chat/updateProfileStatus/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "status": "<string>"
}'
```

#### POST /chat/updateProfilePicture/{instance} - Atualizar Foto do Perfil
```bash
curl --request POST \
  --url https://{server-url}/chat/updateProfilePicture/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "picture": "<string>"
}'
```

#### DELETE /chat/removeProfilePicture/{instance} - Remover Foto do Perfil
```bash
curl --request DELETE \
  --url https://{server-url}/chat/removeProfilePicture/{instance} \
  --header 'apikey: <api-key>'
```

### 4.8 Configurações de Privacidade

#### GET /chat/fetchPrivacySettings/{instance} - Buscar Configurações de Privacidade
```bash
curl --request GET \
  --url https://{server-url}/chat/fetchPrivacySettings/{instance} \
  --header 'apikey: <api-key>'
```

#### POST /chat/updatePrivacySettings/{instance} - Atualizar Configurações de Privacidade
```bash
curl --request POST \
  --url https://{server-url}/chat/updatePrivacySettings/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "readreceipts": "all",
  "profile": "all",
  "status": "all",
  "online": "all",
  "last": "all",
  "groupadd": "all"
}'
```

## 5. Group Controller

### 5.1 Gerenciamento de Grupos

#### POST /group/create/{instance} - Criar Grupo
```bash
curl --request POST \
  --url https://{server-url}/group/create/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "subject": {},
  "description": "<string>",
  "participants": [
    "<string>"
  ]
}'
```

#### POST /group/updateGroupPicture/{instance} - Atualizar Foto do Grupo
```bash
curl --request POST \
  --url https://{server-url}/group/updateGroupPicture/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "image": "<string>"
}'
```

#### POST /group/updateGroupSubject/{instance} - Atualizar Assunto do Grupo
```bash
curl --request POST \
  --url https://{server-url}/group/updateGroupSubject/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "subject": "<string>"
}'
```

#### POST /group/updateGroupDescription/{instance} - Atualizar Descrição do Grupo
```bash
curl --request POST \
  --url https://{server-url}/group/updateGroupDescription/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "description": "<string>"
}'
```

### 5.2 Convites

#### GET /group/inviteCode/{instance} - Obter Código de Convite
```bash
curl --request GET \
  --url https://{server-url}/group/inviteCode/{instance} \
  --header 'apikey: <api-key>'
```

**Resposta:**
```json
{
  "inviteUrl": "https://chat.whatsapp.com/DgQvyfXzY01B6rGrpZpYze",
  "inviteCode": "DgQvyfXzY01B6rGrpZpYze"
}
```

#### POST /group/revokeInviteCode/{instance} - Revogar Código de Convite
```bash
curl --request POST \
  --url https://{server-url}/group/revokeInviteCode/{instance} \
  --header 'apikey: <api-key>'
```

#### POST /group/sendInvite/{instance} - Enviar Convite
```bash
curl --request POST \
  --url https://{server-url}/group/sendInvite/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "groupJid": "<string>",
  "description": "<string>",
  "numbers": [
    "<string>"
  ]
}'
```

**Resposta:**
```json
{
  "send": true,
  "inviteUrl": "https://chat.whatsapp.com/DgQvyfXzY01B6rGrpZpYze"
}
```

#### GET /group/inviteInfo/{instance} - Informações do Convite
```bash
curl --request GET \
  --url https://{server-url}/group/inviteInfo/{instance} \
  --header 'apikey: <api-key>'
```

### 5.3 Informações do Grupo

#### GET /group/findGroupInfos/{instance} - Buscar Informações do Grupo
```bash
curl --request GET \
  --url https://{server-url}/group/findGroupInfos/{instance} \
  --header 'apikey: <api-key>'
```

**Resposta:**
```json
{
  "id": "120363295648424210@g.us",
  "subject": "Example Group",
  "subjectOwner": "553198296801@s.whatsapp.net",
  "subjectTime": 1714769954,
  "pictureUrl": null,
  "size": 1,
  "creation": 1714769954,
  "owner": "553198296801@s.whatsapp.net",
  "desc": "optional",
  "descId": "BAE57E16498982ED",
  "restrict": false,
  "announce": false,
  "participants": [
    {
      "id": "553198296801@s.whatsapp.net",
      "admin": "superadmin"
    }
  ]
}
```

#### GET /group/fetchAllGroups/{instance} - Buscar Todos os Grupos
```bash
curl --request GET \
  --url https://{server-url}/group/fetchAllGroups/{instance} \
  --header 'apikey: <api-key>'
```

**Resposta:**
```json
[
  {
    "id": "120363295648424210@g.us",
    "subject": "Example Group",
    "subjectOwner": "553198296801@s.whatsapp.net",
    "subjectTime": 1714769954,
    "pictureUrl": null,
    "size": 1,
    "creation": 1714769954,
    "owner": "553198296801@s.whatsapp.net",
    "desc": "optional",
    "descId": "BAE57E16498982ED",
    "restrict": false,
    "announce": false
  }
]
```

### 5.4 Participantes

#### GET /group/participants/{instance} - Listar Participantes
```bash
curl --request GET \
  --url https://{server-url}/group/participants/{instance} \
  --header 'apikey: <api-key>'
```

**Resposta:**
```json
{
  "participants": [
    {
      "id": "553198296801@s.whatsapp.net",
      "admin": "superadmin"
    }
  ]
}
```

#### POST /group/updateParticipant/{instance} - Atualizar Participante
```bash
curl --request POST \
  --url https://{server-url}/group/updateParticipant/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "action": "add",
  "participants": [
    "<string>"
  ]
}'
```

### 5.5 Configurações

#### POST /group/updateSetting/{instance} - Atualizar Configurações
```bash
curl --request POST \
  --url https://{server-url}/group/updateSetting/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "action": "announcement"
}'
```

#### POST /group/toggleEphemeral/{instance} - Ativar/Desativar Mensagens Temporárias
```bash
curl --request POST \
  --url https://{server-url}/group/toggleEphemeral/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "expiration": 123
}'
```

#### DELETE /group/leaveGroup/{instance} - Sair do Grupo
```bash
curl --request DELETE \
  --url https://{server-url}/group/leaveGroup/{instance} \
  --header 'apikey: <api-key>'
```

## 6. Evolution Bot

### 6.1 Configuração

#### POST /evolutionBot/create/{instance} - Criar Bot
```bash
curl --request POST \
  --url https://{server-url}/evolutionBot/create/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "enabled": true,
  "apiUrl": "<string>",
  "apiKey": "<string>",
  "triggerType": "<string>",
  "triggerOperator": "<string>",
  "triggerValue": "<string>",
  "expire": 123,
  "keywordFinish": "<string>",
  "delayMessage": 123,
  "unknownMessage": "<string>",
  "listeningFromMe": true,
  "stopBotFromMe": true,
  "keepOpen": true,
  "debounceTime": 123,
  "ignoreJids": [
    "<string>"
  ]
}'
```

#### GET /evolutionBot/find/{instance} - Buscar Bot
```bash
curl --request GET \
  --url https://{server-url}/evolutionBot/find/{instance} \
  --header 'apikey: <api-key>'
```

**Resposta:**
```json
{
  "message": "OK"
}
```

#### GET /evolutionBot/fetch/:evolutionBotId/{instance} - Buscar Bot Específico
```bash
curl --request GET \
  --url https://{server-url}/evolutionBot/fetch/:evolutionBotId/{instance} \
  --header 'apikey: <api-key>'
```

**Resposta:**
```json
{
  "message": "OK"
}
```

### 6.2 Gerenciamento

#### PUT /evolutionBot/update/:evolutionBotId/{instance} - Atualizar Bot
```bash
curl --request PUT \
  --url https://{server-url}/evolutionBot/update/:evolutionBotId/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "enabled": true,
  "apiUrl": "<string>",
  "apiKey": "<string>",
  "triggerType": "<string>",
  "triggerOperator": "<string>",
  "triggerValue": "<string>",
  "expire": 123,
  "keywordFinish": "<string>",
  "delayMessage": 123,
  "unknownMessage": "<string>",
  "listeningFromMe": true,
  "stopBotFromMe": true,
  "keepOpen": true,
  "debounceTime": 123,
  "ignoreJids": [
    "<string>"
  ]
}'
```

**Resposta:**
```json
{
  "message": "Sucess"
}
```

#### DELETE /evolutionBot/delete/:evolutionBotId/{instance} - Deletar Bot
```bash
curl --request DELETE \
  --url https://{server-url}/evolutionBot/delete/:evolutionBotId/{instance} \
  --header 'apikey: <api-key>'
```

### 6.3 Configurações Avançadas

#### POST /evolutionBot/settings/{instance} - Configurações do Bot
```bash
curl --request POST \
  --url https://{server-url}/evolutionBot/settings/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "expire": 123,
  "keywordFinish": "<string>",
  "delayMessage": 123,
  "unknownMessage": "<string>",
  "listeningFromMe": true,
  "stopBotFromMe": true,
  "keepOpen": true,
  "debounceTime": 123,
  "ignoreJids": [
    "<string>"
  ],
  "botIdFallback": "<string>"
}'
```

#### GET /evolutionBot/fetchSettings/{instance} - Buscar Configurações
```bash
curl --request GET \
  --url https://{server-url}/evolutionBot/fetchSettings/{instance} \
  --header 'apikey: <api-key>'
```

#### POST /evolutionBot/changeStatus/{instance} - Alterar Status
```bash
curl --request POST \
  --url https://{server-url}/evolutionBot/changeStatus/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "remoteJid": "<string>",
  "status": "<string>"
}'
```

#### GET /evolutionBot/fetchSessions/:evolutionBotId/{instance} - Buscar Sessões
```bash
curl --request GET \
  --url https://{server-url}/evolutionBot/fetchSessions/:evolutionBotId/{instance} \
  --header 'apikey: <api-key>'
```

## 7. Websocket

### POST /websocket/set/{instance} - Configurar Websocket
```bash
curl --request POST \
  --url https://{server-url}/websocket/set/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "websocket": {
    "enabled": true,
    "events": [
      "APPLICATION_STARTUP"
    ]
  }
}'
```

### GET /websocket/find/{instance} - Buscar Configurações Websocket
```bash
curl --request GET \
  --url https://{server-url}/websocket/find/{instance} \
  --header 'apikey: <api-key>'
```

## 8. Integrações

### 8.1 Amazon SQS

#### POST /sqs/set/{instance} - Configurar SQS
```bash
curl --request POST \
  --url https://{server-url}/sqs/set/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "sqs": {
    "enabled": true,
    "events": [
      "APPLICATION_STARTUP"
    ]
  }
}'
```

#### GET /sqs/find/{instance} - Buscar Configurações SQS
```bash
curl --request GET \
  --url https://{server-url}/sqs/find/{instance} \
  --header 'apikey: <api-key>'
```

### 8.2 RabbitMQ

#### POST /rabbitmq/set/{instance} - Configurar RabbitMQ
```bash
curl --request POST \
  --url https://{server-url}/rabbitmq/set/{instance} \
  --header 'Content-Type: application/json' \
  --header 'apikey: <api-key>' \
  --data '{
  "rabbitmq": {
    "enabled": true,
    "events": [
      "APPLICATION_STARTUP"
    ]
  }
}'
```

#### GET /rabbitmq/find/{instance} - Buscar Configurações RabbitMQ
```bash
curl --request GET \
  --url https://{server-url}/rabbitmq/find/{instance} \
  --header 'apikey: <api-key>'
```