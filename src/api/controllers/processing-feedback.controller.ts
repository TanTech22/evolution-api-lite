import { Request, Response } from 'express';
import { Logger } from '@config/logger.config';
import { BadRequestException, InternalServerErrorException } from '@exceptions';
import {
  processingFeedbackService,
  StartProcessRequest,
  FinishProcessRequest
} from '@api/services/processing-feedback.service';

const logger = new Logger('ProcessingFeedbackController');

export class ProcessingFeedbackController {
  /**
   * Start processing feedback for a message
   * POST /webhook/process/start
   */
  public async startProcessing(request: Request, response: Response) {
    try {
      const data: StartProcessRequest = request.body;

      // Validate required fields
      if (!data.instance) {
        throw new BadRequestException('Field "instance" is required');
      }

      if (!data.chatId) {
        throw new BadRequestException('Field "chatId" is required');
      }

      if (!data.messageId) {
        throw new BadRequestException('Field "messageId" is required');
      }

      // Validate chatId format (basic WhatsApp ID validation)
      if (!data.chatId.includes('@')) {
        throw new BadRequestException('Field "chatId" must be a valid WhatsApp ID (e.g., 5511999999999@s.whatsapp.net)');
      }

      // Start processing
      const result = await processingFeedbackService.startProcessing(data);

      if (!result.success) {
        throw new BadRequestException(result.error || 'Failed to start processing');
      }

      logger.info(`Processing started for ${data.instance}:${data.chatId}:${data.messageId}`);

      return response.status(200).json({
        success: true,
        message: 'Processing started successfully',
        data: {
          sessionId: result.sessionId,
          instance: data.instance,
          chatId: data.chatId,
          messageId: data.messageId,
          processType: data.processType,
          startedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error(`Error starting processing: ${error?.toString()}`);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(error?.toString());
    }
  }

  /**
   * Finish processing feedback for a message
   * POST /webhook/process/finish
   */
  public async finishProcessing(request: Request, response: Response) {
    try {
      const data: FinishProcessRequest = request.body;

      // Validate required fields
      if (!data.instance) {
        throw new BadRequestException('Field "instance" is required');
      }

      if (!data.chatId) {
        throw new BadRequestException('Field "chatId" is required');
      }

      if (!data.messageId) {
        throw new BadRequestException('Field "messageId" is required');
      }

      if (!data.status) {
        throw new BadRequestException('Field "status" is required');
      }

      // Validate status values
      const validStatuses = ['success', 'error', 'aborted'];
      if (!validStatuses.includes(data.status)) {
        throw new BadRequestException(`Field "status" must be one of: ${validStatuses.join(', ')}`);
      }

      // Validate chatId format
      if (!data.chatId.includes('@')) {
        throw new BadRequestException('Field "chatId" must be a valid WhatsApp ID (e.g., 5511999999999@s.whatsapp.net)');
      }

      // Finish processing
      const result = await processingFeedbackService.finishProcessing(data);

      if (!result.success) {
        throw new BadRequestException(result.error || 'Failed to finish processing');
      }

      logger.info(`Processing finished for ${data.instance}:${data.chatId}:${data.messageId} with status: ${data.status}`);

      return response.status(200).json({
        success: true,
        message: 'Processing finished successfully',
        data: {
          instance: data.instance,
          chatId: data.chatId,
          messageId: data.messageId,
          status: data.status,
          errorMessage: data.errorMessage,
          finishedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error(`Error finishing processing: ${error?.toString()}`);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(error?.toString());
    }
  }

  /**
   * Get active processing sessions
   * GET /webhook/process/status
   */
  public async getProcessingStatus(request: Request, response: Response) {
    try {
      const activeSessions = processingFeedbackService.getActiveSessions();
      const stats = processingFeedbackService.getStats();

      return response.status(200).json({
        success: true,
        data: {
          activeSessionsCount: stats.activeCount,
          activeSessions: activeSessions.map(session => ({
            sessionId: session.id,
            instance: session.instance,
            chatId: session.chatId,
            messageId: session.messageId,
            processType: session.processType,
            startTime: session.startTime.toISOString(),
            timeoutAt: session.timeoutAt.toISOString(),
            currentReaction: session.currentReactionIndex,
            runningFor: Date.now() - session.startTime.getTime()
          })),
          stats
        }
      });

    } catch (error) {
      logger.error(`Error getting processing status: ${error?.toString()}`);
      throw new InternalServerErrorException(error?.toString());
    }
  }

  /**
   * Force cleanup of a processing session
   * DELETE /webhook/process/:sessionId
   */
  public async forceCleanup(request: Request, response: Response) {
    try {
      const { sessionId } = request.params;

      if (!sessionId) {
        throw new BadRequestException('Session ID is required');
      }

      const result = await processingFeedbackService.forceCleanup(sessionId);

      if (!result) {
        throw new BadRequestException('Session not found or already cleaned up');
      }

      logger.info(`Force cleanup executed for session: ${sessionId}`);

      return response.status(200).json({
        success: true,
        message: 'Session cleaned up successfully',
        data: {
          sessionId,
          cleanedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error(`Error in force cleanup: ${error?.toString()}`);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(error?.toString());
    }
  }
}