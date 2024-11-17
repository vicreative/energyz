import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { type Request, type Response, type Router } from 'express';
import { z } from 'zod';

import { register } from '@/server';

export const metricRegistry = new OpenAPIRegistry();
export const metricRouter: Router = express.Router();

metricRegistry.registerPath({
  method: 'get',
  path: '/metrics',
  tags: ['Metric'],
  responses: {
    [200]: {
      description: 'Success',
      content: {
        'text/plain': { schema: z.string() },
      },
    },
  },
});

metricRouter.get('/', async (_req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
