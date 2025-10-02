import { Logger } from '@config/logger.config';
import { waMonitor } from '@api/server.module';

export interface ProcessingSession {
  id: string;
  instance: string;
  chatId: string;
  messageId: string;
  processType?: string;
  startTime: Date;
  timeoutAt: Date;
  intervalId?: NodeJS.Timeout;
  timeoutId?: NodeJS.Timeout;
  currentReactionIndex: number;
}

export interface StartProcessRequest {
  instance: string;
  chatId: string;
  messageId: string;
  processType?: string;
}

export interface FinishProcessRequest {
  instance: string;
  chatId: string;
  messageId: string;
  status: 'success' | 'error' | 'aborted';
  errorMessage?: string;
  texto?: string;
}

export class ProcessingFeedbackService {
  private static instance: ProcessingFeedbackService;
  private logger = new Logger('ProcessingFeedback');
  private activeSessions = new Map<string, ProcessingSession>();

  // Reactions configuration
  private readonly PROCESSING_REACTIONS = ['🔄', '⏳'];
  private readonly FINAL_REACTIONS = {
    success: '✅',
    error: '❌',
    aborted: '⚠️',
    timeout: '🤷'
  };
  private readonly LOOP_INTERVAL = 3000; // 3 seconds
  private readonly TIMEOUT_DURATION = 10 * 60 * 1000; // 10 minutes

  private constructor() {}

  public static getInstance(): ProcessingFeedbackService {
    if (!ProcessingFeedbackService.instance) {
      ProcessingFeedbackService.instance = new ProcessingFeedbackService();
    }
    return ProcessingFeedbackService.instance;
  }

  /**
   * Start processing feedback for a message
   */
  public async startProcessing(data: StartProcessRequest): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      const sessionId = this.generateSessionId(data.instance, data.chatId, data.messageId);

      // Check if session already exists
      if (this.activeSessions.has(sessionId)) {
        this.logger.warn(`Processing session already exists: ${sessionId}`);
        return { success: false, error: 'Processing already in progress for this message' };
      }

      // Create session
      const session: ProcessingSession = {
        id: sessionId,
        instance: data.instance,
        chatId: data.chatId,
        messageId: data.messageId,
        processType: data.processType,
        startTime: new Date(),
        timeoutAt: new Date(Date.now() + this.TIMEOUT_DURATION),
        currentReactionIndex: 0
      };

      // Start reaction loop
      await this.startReactionLoop(session);

      // Set timeout
      session.timeoutId = setTimeout(() => {
        this.handleTimeout(sessionId);
      }, this.TIMEOUT_DURATION);

      // Store session
      this.activeSessions.set(sessionId, session);

      this.logger.info(`Processing started: ${sessionId} (${data.instance})`);
      return { success: true, sessionId };

    } catch (error) {
      this.logger.error(`Error starting processing: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Finish processing feedback for a message
   */
  public async finishProcessing(data: FinishProcessRequest): Promise<{ success: boolean; error?: string }> {
    try {
      const sessionId = this.generateSessionId(data.instance, data.chatId, data.messageId);
      const session = this.activeSessions.get(sessionId);

      if (!session) {
        this.logger.warn(`Processing session not found: ${sessionId}`);
        return { success: false, error: 'Processing session not found' };
      }

      // Stop reaction loop
      this.stopReactionLoop(session);

      // Set final reaction
      const finalReaction = this.FINAL_REACTIONS[data.status] || this.FINAL_REACTIONS.error;
      await this.setReaction(session, finalReaction);

      // Send text message if provided
      if (data.texto) {
        await this.sendTextMessage(session, data.texto);
      }

      // Clean up session
      this.cleanupSession(sessionId);

      this.logger.info(`Processing finished: ${sessionId} (${data.status})`);
      return { success: true };

    } catch (error) {
      this.logger.error(`Error finishing processing: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get active sessions (for monitoring)
   */
  public getActiveSessions(): ProcessingSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Get session statistics
   */
  public getStats(): { activeCount: number; totalStarted: number; averageProcessingTime: number } {
    // TODO: Implement statistics tracking if needed
    return {
      activeCount: this.activeSessions.size,
      totalStarted: 0, // Would need to track this
      averageProcessingTime: 0 // Would need to track this
    };
  }

  /**
   * Force cleanup of a specific session
   */
  public async forceCleanup(sessionId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    this.stopReactionLoop(session);
    this.cleanupSession(sessionId);

    this.logger.info(`Force cleanup: ${sessionId}`);
    return true;
  }

  /**
   * Start the reaction loop for a session
   */
  private async startReactionLoop(session: ProcessingSession): Promise<void> {
    // Set initial reaction
    await this.setReaction(session, this.PROCESSING_REACTIONS[0]);

    // Start interval
    session.intervalId = setInterval(async () => {
      session.currentReactionIndex = (session.currentReactionIndex + 1) % this.PROCESSING_REACTIONS.length;
      const reaction = this.PROCESSING_REACTIONS[session.currentReactionIndex];
      await this.setReaction(session, reaction);
    }, this.LOOP_INTERVAL);
  }

  /**
   * Stop the reaction loop for a session
   */
  private stopReactionLoop(session: ProcessingSession): void {
    if (session.intervalId) {
      clearInterval(session.intervalId);
      session.intervalId = undefined;
    }
    if (session.timeoutId) {
      clearTimeout(session.timeoutId);
      session.timeoutId = undefined;
    }
  }

  /**
   * Set a reaction on a message
   */
  private async setReaction(session: ProcessingSession, emoji: string): Promise<void> {
    try {
      const waInstance = waMonitor.waInstances.get(session.instance);
      if (!waInstance) {
        this.logger.error(`WhatsApp instance not found: ${session.instance}`);
        return;
      }

      const messageKey = {
        remoteJid: session.chatId,
        id: session.messageId,
        fromMe: false // Usually reactions are on received messages
      };

      await waInstance.client.sendMessage(session.chatId, {
        react: {
          text: emoji,
          key: messageKey
        }
      });

      this.logger.verbose(`Reaction set: ${emoji} on ${session.instance}:${session.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to set reaction: ${error.message}`);
    }
  }

  /**
   * Send a text message to the chat
   */
  private async sendTextMessage(session: ProcessingSession, texto: string): Promise<void> {
    try {
      const waInstance = waMonitor.waInstances.get(session.instance);
      if (!waInstance) {
        this.logger.error(`WhatsApp instance not found: ${session.instance}`);
        return;
      }

      await waInstance.textMessage({
        number: session.chatId,
        text: texto
      });

      this.logger.info(`Text message sent to ${session.instance}:${session.chatId}: ${texto.substring(0, 50)}${texto.length > 50 ? '...' : ''}`);
    } catch (error) {
      this.logger.error(`Failed to send text message: ${error.message}`);
    }
  }

  /**
   * Handle session timeout
   */
  private async handleTimeout(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    this.logger.warn(`Processing timeout: ${sessionId}`);

    // Stop reaction loop
    this.stopReactionLoop(session);

    // Set timeout reaction
    await this.setReaction(session, this.FINAL_REACTIONS.timeout);

    // Clean up session
    this.cleanupSession(sessionId);
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(instance: string, chatId: string, messageId: string): string {
    return `${instance}:${chatId}:${messageId}`;
  }

  /**
   * Clean up session and timers
   */
  private cleanupSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      this.stopReactionLoop(session);
      this.activeSessions.delete(sessionId);
    }
  }

  /**
   * Clean up all sessions (for graceful shutdown)
   */
  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down ProcessingFeedbackService...');

    for (const [sessionId, session] of Array.from(this.activeSessions.entries())) {
      this.stopReactionLoop(session);
    }

    this.activeSessions.clear();
    this.logger.info('ProcessingFeedbackService shutdown complete');
  }
}

// Export singleton instance
export const processingFeedbackService = ProcessingFeedbackService.getInstance();