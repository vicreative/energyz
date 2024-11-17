import { z } from 'zod';

export const commonValidations = {
  id: z
    .string()
    .refine((data) => !Number.isNaN(Number(data)), 'ID must be a numeric value')
    .refine((data) => data.trim() !== '', 'ID cannot be empty')
    .transform((data) => String(Number(data))),
  name: z.string().min(1, 'Name cannot be empty'),
  description: z
    .string()
    .min(1, 'Description cannot be empty')
    .max(500, 'Description must be at most 500 characters long'),
  status: z.enum(['in_review', 'approved', 'rejected'], {
    errorMap: () => ({
      message: 'Status must be one of: pending, in_review, approved, or rejected',
    }),
  }),
  page: z
    .string({ message: 'page is required' })
    .refine((data) => !Number.isNaN(Number(data)), 'page must be a numeric value')
    .refine((data) => data.trim() !== '', 'page cannot be empty')
    .transform((val) => parseInt(val, 10)),
  pageSize: z
    .string({ message: 'pageSize is required' })
    .refine((data) => !Number.isNaN(Number(data)), 'pageSize must be a numeric value')
    .refine((data) => data.trim() !== '', 'pageSize cannot be empty')
    .transform((val) => parseInt(val, 10)),
  filterByName: z.string().optional(),
  filterByStatus: z.string().optional(),
  sortBy: z.enum(['name', 'status']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
};
