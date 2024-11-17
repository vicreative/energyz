import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { commonValidations } from '@/shared/utils/commonValidation';

extendZodWithOpenApi(z);

export const ApplicationSchema = z.object({
  id: z.string().openapi({ example: '3' }),
  name: z.string().openapi({ example: 'Solar Panel Maintenance' }),
  description: z.string().openapi({
    example: 'Routine maintenance service for solar panel systems to ensure optimal performance.',
  }),
  status: z.enum(['in_review', 'approved', 'rejected']).openapi({ example: 'approved' }),
});

export const ApplicationsSchema = z.object({
  count: z.number().openapi({ example: 1 }),
  records: z.array(ApplicationSchema),
  totalPages: z.number().openapi({ example: 1 }),
  currentPage: z.number().openapi({ example: 1 }),
  nextPage: z.union([z.number(), z.enum(['null'])]).openapi({ example: 'null' }),
  prevPage: z.union([z.number(), z.enum(['null'])]).openapi({ example: 'null' }),
});

export const ApplicationsQuerySchema = z.object({
  page: commonValidations.page.openapi({ example: '1' }),
  pageSize: commonValidations.pageSize.openapi({ example: '10' }),
  filterByName: commonValidations.filterByName.openapi({ example: 'Solar Panel Maintenance' }),
  filterByStatus: commonValidations.filterByName.openapi({ example: 'approved' }),
  sortBy: commonValidations.sortBy.openapi({ example: 'name' }),
  sortOrder: commonValidations.sortOrder.openapi({ example: 'asc' }),
});

// Input Validation for 'GET applications' endpoint
export const GetApplicationsSchema = z.object({
  query: ApplicationsQuerySchema,
});

// Input Validation for 'GET applications/:id' endpoint
export const GetApplicationSchema = z.object({
  params: z.object({ id: commonValidations.id.openapi({ example: '1' }) }),
});

// Input Validation for 'POST applications' endpoint
export const PostApplicationSchema = z.object({
  body: z.object({
    name: commonValidations.name.openapi({ example: 'Solar Panel Installation - Commercial' }),
    description: commonValidations.description.openapi({
      example: 'A comprehensive installation of solar panels for residential properties.',
    }),
  }),
});

// Input Validation for 'PATCH applications' endpoint
export const PatchApplicationSchema = z.object({
  params: z.object({ id: commonValidations.id.openapi({ example: '1' }) }),
  body: z
    .object({
      name: commonValidations.name.openapi({ example: 'Solar Panel Installation - Commercial' }),
      description: commonValidations.description.openapi({
        example: 'A comprehensive installation of solar panels for residential properties.',
      }),
      status: commonValidations.status.openapi({ example: 'approved' }),
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field (name, description or status) must be provided.',
    }),
});

// Input Validation for 'DELETE applications/:id' endpoint
export const DeleteApplicationSchema = z.object({
  params: z.object({ id: commonValidations.id.openapi({ example: '1' }) }),
});
