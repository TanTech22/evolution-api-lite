import { RequestHandler, Router } from 'express';
import { Logger } from '@config/logger.config';
import { authGuard } from '@api/guards/auth.guard';
import { ProcessingFeedbackController } from '@api/controllers/processing-feedback.controller';

const logger = new Logger('ProcessingFeedbackRouter');

export class ProcessingFeedbackRouter {
  public readonly router = Router();
  private readonly controller = new ProcessingFeedbackController();

  constructor() {
    console.log('ProcessingFeedbackRouter constructor called');
    this.routes();
    console.log('ProcessingFeedbackRouter routes configured, router stack:', this.router.stack?.length || 0);
  }

  private routes() {
    this.router
      // Test route for debugging
      .get('/process/test', authGuard['apikey'], (req, res) => {
        res.json({ message: 'Processing router is working', timestamp: new Date().toISOString() });
      })

      // Start processing with feedback
      .post('/process/start', authGuard['apikey'], this.controller.startProcessing.bind(this.controller))

      // Finish processing with result
      .post('/process/finish', authGuard['apikey'], this.controller.finishProcessing.bind(this.controller))

      // Get status of all active processing sessions
      .get('/process/status', authGuard['apikey'], this.controller.getProcessingStatus.bind(this.controller))

      // Force cleanup of a specific session (for debugging/admin)
      .delete('/process/:sessionId', authGuard['apikey'], this.controller.forceCleanup.bind(this.controller));

    logger.info('Processing Feedback routes initialized');
  }
}

export const processingFeedbackRouter = new ProcessingFeedbackRouter();