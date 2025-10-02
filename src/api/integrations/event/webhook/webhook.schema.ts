import { JSONSchema7 } from 'json-schema';
import { v4 } from 'uuid';

import { EventController } from '../event.controller';

const isNotEmpty = (...propertyNames: string[]): JSONSchema7 => {
  const properties = {};
  propertyNames.forEach(
    (property) =>
      (properties[property] = {
        minLength: 1,
        description: `The "${property}" cannot be empty`,
      }),
  );
  return {
    if: {
      propertyNames: {
        enum: [...propertyNames],
      },
    },
    then: { properties },
  };
};

const messageTypesList = [
  'conversation',
  'extendedTextMessage',
  'audioMessage',
  'imageMessage',
  'videoMessage',
  'documentMessage',
  'contactMessage',
  'locationMessage',
  'listResponseMessage',
  'templateButtonReplyMessage',
  'viewOnceMessageV2',
  'documentWithCaptionMessage',
  'stickerMessage',
  'ptvMessage'
];

export const webhookSchema: JSONSchema7 = {
  $id: v4(),
  type: 'object',
  properties: {
    webhook: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        url: { type: 'string' },
        headers: { type: 'object' },
        byEvents: { type: 'boolean' },
        base64: { type: 'boolean' },
        events: {
          type: 'array',
          minItems: 0,
          items: {
            type: 'string',
            enum: EventController.events,
          },
        },
        messageTypes: {
          type: 'array',
          minItems: 0,
          items: {
            type: 'string',
            enum: messageTypesList,
          },
          description: 'Lista de tipos de mensagem permitidos'
        },
        excludeMessageTypes: {
          type: 'array',
          minItems: 0,
          items: {
            type: 'string',
            enum: messageTypesList,
          },
          description: 'Lista de tipos de mensagem excluídos'
        },
        textFilters: {
          type: 'object',
          properties: {
            allowedWords: {
              type: 'array',
              items: { type: 'string' },
              description: 'Palavras que devem estar presentes no texto'
            },
            blockedWords: {
              type: 'array',
              items: { type: 'string' },
              description: 'Palavras que não podem estar no texto'
            },
            allowedPatterns: {
              type: 'array',
              items: { type: 'string' },
              description: 'Padrões regex que o texto deve corresponder'
            },
            blockedPatterns: {
              type: 'array',
              items: { type: 'string' },
              description: 'Padrões regex que o texto não pode corresponder'
            }
          }
        },
      },
      required: ['enabled', 'url'],
      ...isNotEmpty('enabled', 'url'),
    },
  },
  required: ['webhook'],
};
