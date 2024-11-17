import { StatusCodes } from 'http-status-codes';
import type { z } from 'zod';

import { ServiceResponseSchema } from '@/shared/models/serviceResponse';

export function createApiResponse(
  schema: z.ZodTypeAny,
  description: string,
  message: string,
  statusCode = StatusCodes.OK,
) {
  return {
    [statusCode]: {
      description,
      content:
        statusCode === StatusCodes.NO_CONTENT
          ? undefined
          : {
              'application/json': {
                schema: ServiceResponseSchema(schema, statusCode, message),
              },
            },
    },
  };
}
