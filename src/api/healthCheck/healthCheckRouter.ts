import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { type Request, type Response, type Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { ServiceResponse } from '@/shared/models/serviceResponse';
import { handleServiceResponse } from '@/shared/utils/httpHandlers';

export const healthCheckRegistry = new OpenAPIRegistry();
export const healthCheckRouter: Router = express.Router();

healthCheckRegistry.registerPath({
  method: 'get',
  path: '/health-check',
  tags: ['Health Check'],
  responses: createApiResponse(z.null(), 'Success', 'Service is healthy'),
});

healthCheckRouter.get('/', (_req: Request, res: Response) => {
  const serviceResponse = ServiceResponse.success('Service is healthy', null);
  handleServiceResponse(serviceResponse, res);
});
