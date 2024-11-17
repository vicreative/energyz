import { z } from 'zod';
import { ApplicationSchema, ApplicationsQuerySchema } from './applicationModel';

export type Application = z.infer<typeof ApplicationSchema>;

export type FindAllApplicationsParams = z.infer<typeof ApplicationsQuerySchema>;

export interface FindAllApplicationsResponse {
  count: number;
  records: Application[];
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
}

export interface CreateAsyncParams {
  description: Application['description'];
  status: Application['status'];
  name: Application['name'];
}
