import { Logger } from '@config/logger.config';
import { getConversationMessage } from './getConversationMessage';
import { AudioFilterStatsService } from '@api/services/audio-filter-stats.service';
import { configService } from '@config/env.config';

const logger = new Logger('MessageFilter');

export interface MessageTypeFilter {
  messageTypes?: string[];
  excludeMessageTypes?: string[];
  textFilters?: {
    allowedWords?: string[];
    blockedWords?: string[];
    allowedPatterns?: string[];
    blockedPatterns?: string[];
  };
  audioDurationFilter?: {
    enabled?: boolean;
    minDurationSeconds?: number;
    maxDurationSeconds?: number;
    oversizeDurationMessage?: string;
    replyToInvalidDuration?: boolean;
    replyToOversizeAudio?: boolean;
    oversizeReaction?: string;
  };
}

export interface FilterResult {
  allowed: boolean;
  reason?: string;
  shouldReplyToOversizeAudio?: boolean;
  oversizeMessage?: string;
  shouldReplyToInvalidDuration?: boolean;
  invalidDurationMessage?: string;
  remoteJid?: string;
}

/**
 * Aplica filtros de segurança máxima para mensagens
 * CRITICAL: Esta função determina se dados devem ser persistidos/processados
 */
export function applyMessageFilter(
  message: any,
  filters: MessageTypeFilter,
  instanceName: string
): FilterResult {
  try {
    // Extrair informações da mensagem
    const messageTypes = getMessageTypes(message);
    const messageContent = getConversationMessage(message);
    const audioSize = getAudioSize(message);
    const audioDuration = getAudioDuration(message);
    const remoteJid = message?.key?.remoteJid;

    logger.log(`[${instanceName}] Filtering message - Type: ${messageTypes.primaryType}, Size: ${audioSize || 'N/A'} bytes, Duration: ${audioDuration || 'N/A'} seconds`);

    // 1. FILTRO DE TIPO DE MENSAGEM
    const typeFilterResult = applyTypeFilter(messageTypes.primaryType, filters);
    if (!typeFilterResult.allowed) {
      logger.log(`[${instanceName}] Message BLOCKED by type filter: ${typeFilterResult.reason}`);
      return typeFilterResult;
    }

    // 2. FILTRO DE ÁUDIO POR TAMANHO
    if (messageTypes.primaryType === 'audioMessage' && audioSize) {
      const audioFilterResult = applyAudioFilter(audioSize, filters, remoteJid);
      if (!audioFilterResult.allowed) {
        logger.log(`[${instanceName}] Audio BLOCKED by size filter: ${audioFilterResult.reason}`);
        return audioFilterResult;
      }
    }

    // 2.1. FILTRO DE ÁUDIO POR DURAÇÃO
    if (messageTypes.primaryType === 'audioMessage' && audioDuration !== null) {
      const durationFilterResult = applyAudioDurationFilter(audioDuration, filters, remoteJid, instanceName);
      if (!durationFilterResult.allowed) {
        logger.log(`[${instanceName}] Audio BLOCKED by duration filter: ${durationFilterResult.reason}`);
        return durationFilterResult;
      }
    }

    // 3. FILTRO DE TEXTO (apenas para mensagens de texto)
    if (messageTypes.isText && messageContent) {
      const textFilterResult = applyTextFilter(messageContent, filters);
      if (!textFilterResult.allowed) {
        logger.log(`[${instanceName}] Text BLOCKED by content filter: ${textFilterResult.reason}`);
        return textFilterResult;
      }
    }

    logger.log(`[${instanceName}] Message ALLOWED - passed all filters`);
    return { allowed: true };

  } catch (error) {
    logger.error(`[${instanceName}] Error in message filter: ${error.message}`);
    // Em caso de erro, bloqueia por segurança
    return {
      allowed: false,
      reason: `Filter error: ${error.message}`
    };
  }
}

/**
 * Extrai tipos de mensagem da estrutura do Baileys
 */
function getMessageTypes(message: any): { primaryType: string; isText: boolean; allTypes: string[] } {
  const messageObj = message?.message || {};
  const allTypes: string[] = [];
  let primaryType = 'unknown';
  let isText = false;

  // Tipos conhecidos de mensagem
  const knownTypes = [
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

  // Identifica todos os tipos presentes
  for (const type of knownTypes) {
    if (messageObj[type]) {
      allTypes.push(type);
      if (primaryType === 'unknown') {
        primaryType = type;
      }
    }
  }

  // Determina se é mensagem de texto
  isText = primaryType === 'conversation' || primaryType === 'extendedTextMessage';

  return { primaryType, isText, allTypes };
}

/**
 * Obtém tamanho do arquivo de áudio
 */
function getAudioSize(message: any): number | null {
  const audioMessage = message?.message?.audioMessage;
  if (!audioMessage) return null;

  // Tenta diferentes propriedades onde o tamanho pode estar
  const fileLength = audioMessage.fileLength?.low ||
                    audioMessage.fileLength ||
                    audioMessage.fileSha256?.length ||
                    null;

  return typeof fileLength === 'number' ? fileLength : null;
}

/**
 * Obtém duração do áudio em segundos
 */
function getAudioDuration(message: any): number | null {
  const audioMessage = message?.message?.audioMessage;
  if (!audioMessage) return null;

  // A duração pode estar em diferentes propriedades
  const duration = audioMessage.seconds ||
                   audioMessage.duration ||
                   null;

  return typeof duration === 'number' ? duration : null;
}

/**
 * Aplica filtro de tipo de mensagem
 */
function applyTypeFilter(messageType: string, filters: MessageTypeFilter): FilterResult {
  const { messageTypes, excludeMessageTypes } = filters;

  // Se tem lista de exclusão e o tipo está nela, bloqueia
  if (excludeMessageTypes?.length && excludeMessageTypes.includes(messageType)) {
    return {
      allowed: false,
      reason: `Message type '${messageType}' is in exclude list`
    };
  }

  // Se tem lista de inclusão e o tipo NÃO está nela, bloqueia
  if (messageTypes?.length && !messageTypes.includes(messageType)) {
    return {
      allowed: false,
      reason: `Message type '${messageType}' is not in allowed list`
    };
  }

  return { allowed: true };
}

/**
 * Aplica filtro de áudio por tamanho
 */
function applyAudioFilter(audioSize: number, filters: MessageTypeFilter, remoteJid?: string): FilterResult {
  // FILTRO GLOBAL FIXO - 24MB sempre
  const GLOBAL_MAX_SIZE_BYTES = 25165824; // 24MB

  if (audioSize > GLOBAL_MAX_SIZE_BYTES) {
    return {
      allowed: false,
      reason: `Audio size ${audioSize} bytes exceeds global limit ${GLOBAL_MAX_SIZE_BYTES} bytes`,
      shouldReplyToOversizeAudio: true,
      oversizeMessage: '⛔', // Reaction fixa global
      remoteJid
    };
  }

  return { allowed: true };
}

/**
 * Aplica filtro de áudio por duração
 */
function applyAudioDurationFilter(audioDuration: number, filters: MessageTypeFilter, remoteJid?: string, instanceName?: string): FilterResult {
  const durationConfig = filters.audioDurationFilter;
  if (!durationConfig || !durationConfig.enabled) return { allowed: true };

  const minDuration = durationConfig.minDurationSeconds || 3;
  const maxDuration = durationConfig.maxDurationSeconds || 300; // 5 minutos default

  // Obter instância do serviço de estatísticas
  const statsService = AudioFilterStatsService.getInstance();

  if (audioDuration < minDuration) {
    // Incrementar estatística de áudio muito curto
    if (instanceName) {
      statsService.incrementTooShort(instanceName);
    }

    // Não envia mais reação para áudios muito curtos - apenas bloqueia silenciosamente
    return {
      allowed: false,
      reason: `Audio duration ${audioDuration}s is below minimum ${minDuration}s`,
      remoteJid
    };
  }

  if (audioDuration > maxDuration) {
    // Incrementar estatística de áudio muito longo
    if (instanceName) {
      statsService.incrementTooLong(instanceName);
    }

    // Obter configuração global para verificar se excede limite do sistema
    const globalConfig = configService.get<any>('AUDIO_FILTER');
    const globalMaxDuration = globalConfig?.MAX_DURATION || 7200; // 2 horas default

    // Se excede limite global do sistema, envia mensagem de oversize
    if (audioDuration > globalMaxDuration) {
      return {
        allowed: false,
        reason: `Audio duration ${audioDuration}s exceeds global maximum ${globalMaxDuration}s`,
        shouldReplyToInvalidDuration: true,
        invalidDurationMessage: globalConfig?.OVERSIZE_MESSAGE || 'Áudio acima do limite de 2 horas',
        remoteJid
      };
    }

    // Se excede apenas limite da instância, bloqueia silenciosamente
    return {
      allowed: false,
      reason: `Audio duration ${audioDuration}s exceeds instance maximum ${maxDuration}s`,
      remoteJid
    };
  }

  // Incrementar estatística de áudio processado com sucesso
  if (instanceName) {
    statsService.incrementProcessed(instanceName);
  }

  return { allowed: true };
}

/**
 * Aplica filtros de texto
 */
function applyTextFilter(messageContent: string, filters: MessageTypeFilter): FilterResult {
  const textFilters = filters.textFilters;
  if (!textFilters) return { allowed: true };

  const content = messageContent.toLowerCase();

  // Palavras bloqueadas
  if (textFilters.blockedWords?.length) {
    for (const word of textFilters.blockedWords) {
      if (content.includes(word.toLowerCase())) {
        return {
          allowed: false,
          reason: `Text contains blocked word: '${word}'`
        };
      }
    }
  }

  // Padrões bloqueados (regex)
  if (textFilters.blockedPatterns?.length) {
    for (const pattern of textFilters.blockedPatterns) {
      try {
        if (new RegExp(pattern, 'i').test(content)) {
          return {
            allowed: false,
            reason: `Text matches blocked pattern: '${pattern}'`
          };
        }
      } catch (error) {
        logger.error(`Invalid regex pattern: ${pattern}`);
      }
    }
  }

  // Palavras permitidas (se especificadas, texto DEVE conter pelo menos uma)
  if (textFilters.allowedWords?.length) {
    const hasAllowedWord = textFilters.allowedWords.some(word =>
      content.includes(word.toLowerCase())
    );
    if (!hasAllowedWord) {
      return {
        allowed: false,
        reason: `Text does not contain any allowed words`
      };
    }
  }

  // Padrões permitidos (se especificados, texto DEVE corresponder pelo menos um)
  if (textFilters.allowedPatterns?.length) {
    const matchesAllowedPattern = textFilters.allowedPatterns.some(pattern => {
      try {
        return new RegExp(pattern, 'i').test(content);
      } catch (error) {
        logger.error(`Invalid regex pattern: ${pattern}`);
        return false;
      }
    });

    if (!matchesAllowedPattern) {
      return {
        allowed: false,
        reason: `Text does not match any allowed patterns`
      };
    }
  }

  return { allowed: true };
}

/**
 * Configuração padrão do filtro
 */
export const defaultMessageFilter: MessageTypeFilter = {
  messageTypes: ['audioMessage', 'conversation'],
  textFilters: {
    allowedPatterns: ['^[/\\\\]'] // Textos começando com / ou \
  },
  audioDurationFilter: {
    enabled: true, // Habilitado por padrão
    minDurationSeconds: 3,
    maxDurationSeconds: 300, // 5 minutos (padrão da instância)
    oversizeDurationMessage: 'Áudio muito longo. Máximo: 5 minutos',
    replyToInvalidDuration: false // Por padrão não envia resposta - cliente configura se quer
  }
};