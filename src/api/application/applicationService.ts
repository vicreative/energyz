import { StatusCodes } from 'http-status-codes';

import { ApplicationRepository } from '@/api/application/applicationRepository';
import { ServiceResponse } from '@/shared/models/serviceResponse';
import { logger } from '@/server';
import {
  Application,
  CreateAsyncParams,
  FindAllApplicationsParams,
  FindAllApplicationsResponse,
} from './types';

export class ApplicationService {
  private applicationRepository: ApplicationRepository;

  constructor(repository: ApplicationRepository = new ApplicationRepository()) {
    this.applicationRepository = repository;
  }

  // Retrieves all applications from the database
  async findAllApplications({
    page = 1,
    pageSize = 10,
    filterByName = '',
    filterByStatus = '',
    sortBy = 'name',
    sortOrder = 'asc',
  }: FindAllApplicationsParams): Promise<ServiceResponse<FindAllApplicationsResponse | null>> {
    try {
      const result = await this.applicationRepository.findAllAsync({
        page,
        pageSize,
        filterByName,
        filterByStatus,
        sortBy,
        sortOrder,
      });

      return ServiceResponse.success<FindAllApplicationsResponse>('Success', result);
    } catch (ex) {
      const errorMessage = `Error finding all applications: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while retrieving applications.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Retrieves a single application by their ID
  async findApplicationById(id: string): Promise<ServiceResponse<Application | null>> {
    try {
      const application = await this.applicationRepository.findByIdAsync(id);
      if (!application) {
        return ServiceResponse.failure('Application not found', null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<Application>('Application found', application);
    } catch (ex) {
      const errorMessage = `Error finding application with id ${id}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while finding application.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Creates a new application
  async createApplication({
    name,
    description,
  }: {
    name: string;
    description: string;
  }): Promise<ServiceResponse<Application | null>> {
    try {
      const payload: CreateAsyncParams = {
        name,
        description,
        status: 'in_review', // default status
      };
      const application = await this.applicationRepository.createAsync(payload);
      return ServiceResponse.success<Application>(
        'Application created',
        application,
        StatusCodes.CREATED,
      );
    } catch (ex) {
      const errorMessage = `Error creating application: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while creating the application.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Updates an existing application
  async updateApplication(
    id: string,
    updatedApp: Partial<Application>,
  ): Promise<ServiceResponse<Application | null>> {
    try {
      const application = await this.applicationRepository.findByIdAsync(id);
      if (!application) {
        return ServiceResponse.failure('Application not found', null, StatusCodes.NOT_FOUND);
      }

      const updatedApplication = { ...application, ...updatedApp };
      await this.applicationRepository.updateAsync(id, updatedApplication);
      return ServiceResponse.success<Application>('Application updated', updatedApplication);
    } catch (ex) {
      const errorMessage = `Error updating application with id ${id}: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while updating the application.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Deletes an application by ID
  async deleteApplication(id: string): Promise<ServiceResponse<null>> {
    try {
      const application = await this.applicationRepository.findByIdAsync(id);
      if (!application) {
        return ServiceResponse.failure('Application not found', null, StatusCodes.NOT_FOUND);
      }

      await this.applicationRepository.deleteAsync(id);
      return ServiceResponse.success<null>('Application deleted', null, StatusCodes.NO_CONTENT);
    } catch (ex) {
      const errorMessage = `Error deleting application with id ${id}: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while deleting the application.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export const applicationService = new ApplicationService();
