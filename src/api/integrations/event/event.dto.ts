import { Constructor } from '@api/integrations/integration.dto';
import { JsonValue } from '@prisma/client/runtime/library';

export class EventDto {
  webhook?: {
    enabled?: boolean;
    events?: string[];
    url?: string;
    headers?: JsonValue;
    byEvents?: boolean;
    base64?: boolean;
    messageTypes?: string[];
    excludeMessageTypes?: string[];
    textFilters?: {
      allowedWords?: string[];
      blockedWords?: string[];
      allowedPatterns?: string[];
      blockedPatterns?: string[];
    };
  };

  websocket?: {
    enabled?: boolean;
    events?: string[];
    messageTypes?: string[];
    excludeMessageTypes?: string[];
    textFilters?: {
      allowedWords?: string[];
      blockedWords?: string[];
      allowedPatterns?: string[];
      blockedPatterns?: string[];
    };
  };

  sqs?: {
    enabled?: boolean;
    events?: string[];
    messageTypes?: string[];
    excludeMessageTypes?: string[];
    textFilters?: {
      allowedWords?: string[];
      blockedWords?: string[];
      allowedPatterns?: string[];
      blockedPatterns?: string[];
    };
  };

  rabbitmq?: {
    enabled?: boolean;
    events?: string[];
    messageTypes?: string[];
    excludeMessageTypes?: string[];
    textFilters?: {
      allowedWords?: string[];
      blockedWords?: string[];
      allowedPatterns?: string[];
      blockedPatterns?: string[];
    };
  };

  pusher?: {
    enabled?: boolean;
    appId?: string;
    key?: string;
    secret?: string;
    cluster?: string;
    useTLS?: boolean;
    events?: string[];
    messageTypes?: string[];
    excludeMessageTypes?: string[];
    textFilters?: {
      allowedWords?: string[];
      blockedWords?: string[];
      allowedPatterns?: string[];
      blockedPatterns?: string[];
    };
  };
}

export function EventInstanceMixin<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    webhook?: {
      enabled?: boolean;
      events?: string[];
      headers?: JsonValue;
      url?: string;
      byEvents?: boolean;
      base64?: boolean;
      messageTypes?: string[];
      excludeMessageTypes?: string[];
      textFilters?: {
        allowedWords?: string[];
        blockedWords?: string[];
        allowedPatterns?: string[];
        blockedPatterns?: string[];
      };
    };

    websocket?: {
      enabled?: boolean;
      events?: string[];
      messageTypes?: string[];
      excludeMessageTypes?: string[];
      textFilters?: {
        allowedWords?: string[];
        blockedWords?: string[];
        allowedPatterns?: string[];
        blockedPatterns?: string[];
      };
    };

    sqs?: {
      enabled?: boolean;
      events?: string[];
      messageTypes?: string[];
      excludeMessageTypes?: string[];
      textFilters?: {
        allowedWords?: string[];
        blockedWords?: string[];
        allowedPatterns?: string[];
        blockedPatterns?: string[];
      };
    };

    rabbitmq?: {
      enabled?: boolean;
      events?: string[];
      messageTypes?: string[];
      excludeMessageTypes?: string[];
      textFilters?: {
        allowedWords?: string[];
        blockedWords?: string[];
        allowedPatterns?: string[];
        blockedPatterns?: string[];
      };
    };

    pusher?: {
      enabled?: boolean;
      appId?: string;
      key?: string;
      secret?: string;
      cluster?: string;
      useTLS?: boolean;
      events?: string[];
      messageTypes?: string[];
      excludeMessageTypes?: string[];
      textFilters?: {
        allowedWords?: string[];
        blockedWords?: string[];
        allowedPatterns?: string[];
        blockedPatterns?: string[];
      };
    };
  };
}
