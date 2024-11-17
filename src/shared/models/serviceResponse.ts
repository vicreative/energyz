import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

extendZodWithOpenApi(z);

export class ServiceResponse<T = null> {
  readonly success: boolean;
  readonly message: string;
  readonly responseObject: T;
  readonly statusCode: number;

  private constructor(success: boolean, message: string, responseObject: T, statusCode: number) {
    this.success = success;
    this.message = message;
    this.responseObject = responseObject;
    this.statusCode = statusCode;
  }

  static success<T>(message: string, responseObject: T, statusCode: number = StatusCodes.OK) {
    return new ServiceResponse(true, message, responseObject, statusCode);
  }

  static failure<T>(
    message: string,
    responseObject: T,
    statusCode: number = StatusCodes.BAD_REQUEST,
  ) {
    return new ServiceResponse(false, message, responseObject, statusCode);
  }
}

export const ServiceResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T,
  statusCode = StatusCodes.OK,
  message: string,
) =>
  z.object(
    statusCode === StatusCodes.NO_CONTENT
      ? {}
      : {
          success: z.boolean(),
          message: z.string().openapi({ example: message }),
          responseObject: dataSchema.optional(),
          statusCode: z.number().openapi({ example: statusCode }),
        },
  );
