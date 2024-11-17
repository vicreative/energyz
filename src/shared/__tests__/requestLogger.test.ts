import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import errorHandler from '@/shared/middleware/errorHandler';
import requestLogger from '@/shared/middleware/requestLogger';

describe('Request Logger Middleware', () => {
  const app = express();

  beforeAll(() => {
    app.use(requestLogger);
    app.get('/success', (_req: Request, res: Response) => {
      res.status(StatusCodes.OK).send('Success');
    });
    app.get('/redirect', (_req: Request, res: Response) => res.redirect('/success'));
    app.get('/error', () => {
      throw new Error('Test error');
    });
    app.use(errorHandler());
  });

  describe('Successful requests', () => {
    it('logs successful requests', async () => {
      const response = await request(app).get('/success');
      expect(response.status).toBe(StatusCodes.OK);
    });

    it('checks existing request id', async () => {
      const requestId = 'test-request-id';
      const response = await request(app).get('/success').set('X-Request-Id', requestId);
      expect(response.status).toBe(StatusCodes.OK);
    });
  });

  describe('Re-directions', () => {
    it('logs re-directions correctly', async () => {
      const response = await request(app).get('/redirect');
      expect(response.status).toBe(StatusCodes.MOVED_TEMPORARILY);
    });
  });

  describe('Error handling', () => {
    it('logs thrown errors with a 500 status code', async () => {
      const response = await request(app).get('/error');
      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('logs 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown');
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });
});
