import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { RequestHandler, type Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import {
  ApplicationSchema,
  ApplicationsSchema,
  DeleteApplicationSchema,
  GetApplicationSchema,
  GetApplicationsSchema,
  PatchApplicationSchema,
  PostApplicationSchema,
} from '@/api/application/applicationModel';
import { validateRequest } from '@/shared/utils/httpHandlers';
import { applicationController } from './applicationController';
import { StatusCodes } from 'http-status-codes';

export const applicationRegistry = new OpenAPIRegistry();
export const applicationRouter: Router = express.Router();

applicationRegistry.register('Application', ApplicationSchema);

applicationRegistry.registerPath({
  method: 'get',
  path: '/applications',
  tags: ['Application'],
  request: { query: GetApplicationsSchema.shape.query },
  responses: createApiResponse(ApplicationsSchema, 'Success', 'Success'),
});

applicationRouter.get('/', validateRequest(GetApplicationsSchema) as RequestHandler, (req, res) => {
  applicationController.getApplications(req, res);
});

applicationRegistry.registerPath({
  method: 'get',
  path: '/applications/{id}',
  tags: ['Application'],
  request: { params: GetApplicationSchema.shape.params },
  responses: createApiResponse(ApplicationSchema, 'Success', 'Application found'),
});

applicationRouter.get(
  '/:id',
  validateRequest(GetApplicationSchema) as RequestHandler,
  (req, res) => {
    applicationController.getApplication(req, res);
  },
);

applicationRegistry.registerPath({
  method: 'post',
  path: '/applications',
  tags: ['Application'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: PostApplicationSchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(
    ApplicationSchema,
    'Created',
    'Application created',
    StatusCodes.CREATED,
  ),
});

applicationRouter.post(
  '/',
  validateRequest(PostApplicationSchema) as RequestHandler,
  (req, res) => {
    applicationController.createApplication(req, res);
  },
);

applicationRegistry.registerPath({
  method: 'patch',
  path: '/applications/{id}',
  tags: ['Application'],
  request: {
    params: PatchApplicationSchema.shape.params,
    body: {
      content: {
        'application/json': {
          schema: PatchApplicationSchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(ApplicationSchema, 'Success', 'Application updated'),
});

applicationRouter.patch(
  '/:id',
  validateRequest(PatchApplicationSchema) as RequestHandler,
  (req, res) => {
    applicationController.updateApplication(req, res);
  },
);

applicationRegistry.registerPath({
  method: 'delete',
  path: '/applications/{id}',
  tags: ['Application'],
  request: { params: DeleteApplicationSchema.shape.params },
  responses: createApiResponse(
    z.null(),
    'No Content',
    'Application deleted',
    StatusCodes.NO_CONTENT,
  ),
});

applicationRouter.delete(
  '/:id',
  validateRequest(DeleteApplicationSchema) as RequestHandler,
  (req, res) => {
    applicationController.deleteApplication(req, res);
  },
);
