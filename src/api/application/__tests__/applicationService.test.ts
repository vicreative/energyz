import { StatusCodes } from 'http-status-codes';

import { ApplicationRepository } from '@/api/application/applicationRepository';
import { Application } from '@/api/application/types';
import { ApplicationService } from '@/api/application/applicationService';
import { loadData } from '@/shared/utils/loadData';

jest.mock('@/api/application/applicationRepository');

describe('applicationService', () => {
  let applicationServiceInstance: ApplicationService;
  let applicationRepositoryInstance: jest.Mocked<ApplicationRepository>;

  const mockApplications: Application[] = loadData();

  let mockLastId = mockApplications.reduce((max, app) => Math.max(max, parseInt(app.id, 10)), 0);

  beforeEach(() => {
    applicationRepositoryInstance =
      new ApplicationRepository() as jest.Mocked<ApplicationRepository>;
    applicationServiceInstance = new ApplicationService(applicationRepositoryInstance);
  });

  describe('findAllApplications', () => {
    it('returns all applications', async () => {
      // Arrange
      const page = 1;
      const pageSize = 2;
      const totalRecords = mockApplications.length;
      const totalPages = Math.ceil(totalRecords / pageSize);

      applicationRepositoryInstance.findAllAsync.mockResolvedValue({
        count: totalRecords,
        records: mockApplications.slice(0, pageSize), // Mocking the first two applications
        totalPages,
        currentPage: page,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      });

      // Act
      const result = await applicationServiceInstance.findAllApplications({
        page,
        pageSize,
        filterByName: 'Test',
        filterByStatus: 'approved',
        sortBy: 'name',
        sortOrder: 'asc',
      });

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toEqual('Success');
      expect(result.responseObject?.records.length).toBeLessThanOrEqual(2); // Check pagination
      expect(result.responseObject?.count).toEqual(totalRecords); // Check total pages
      expect(result.responseObject?.totalPages).toEqual(totalPages); // Check total pages
      expect(result.responseObject?.currentPage).toEqual(page); // Check current page
      expect(result.responseObject?.nextPage).toEqual(page < totalPages ? page + 1 : null); // Check next page
      expect(result.responseObject?.prevPage).toEqual(page > 1 ? page - 1 : null); // Check previous page

      // Check for duplicate IDs
      const idSet = new Set();
      const hasDuplicates = result.responseObject?.records.some((application) => {
        if (idSet.has(application.id)) {
          return true;
        }
        idSet.add(application.id);
        return false;
      });
      expect(hasDuplicates).toBeFalsy();
    });

    it('handles errors for findAllAsync', async () => {
      // Arrange
      applicationRepositoryInstance.findAllAsync.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await applicationServiceInstance.findAllApplications({
        page: 1,
        pageSize: 2,
        filterByName: 'Test',
        sortBy: 'name',
        sortOrder: 'asc',
      });

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
      expect(result.message).toEqual('An error occurred while retrieving applications.');
      expect(result.responseObject).toBeNull();
    });
  });

  describe('findApplicationById', () => {
    it('returns an application for a valid ID', async () => {
      // Arrange
      const testId = '1';
      const mockApplication =
        mockApplications.find((application) => application.id === testId) || null;
      applicationRepositoryInstance.findByIdAsync.mockResolvedValue(mockApplication);

      // Act
      const result = await applicationServiceInstance.findApplicationById(testId);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toEqual('Application found');
      expect(result.responseObject).toEqual(mockApplication);
    });

    it('handles errors for findByIdAsync', async () => {
      // Arrange
      const testId = '1';
      applicationRepositoryInstance.findByIdAsync.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await applicationServiceInstance.findApplicationById(testId);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
      expect(result.message).toEqual('An error occurred while finding application.');
      expect(result.responseObject).toBeNull();
    });

    it('returns a not found error for a non-existent ID', async () => {
      // Arrange
      const testId = '1';
      applicationRepositoryInstance.findByIdAsync.mockResolvedValue(null);

      // Act
      const result = await applicationServiceInstance.findApplicationById(testId);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toEqual('Application not found');
      expect(result.responseObject).toBeNull();
    });
  });

  describe('createApplication', () => {
    it('creates a new application successfully', async () => {
      // Arrange
      const newAppData = { name: 'Test App', description: 'Test Description' };
      const expectedId = (mockLastId + 1).toString();
      const expectedApplication: Application = {
        id: expectedId,
        name: 'Test App',
        description: 'Test Description',
        status: 'in_review',
      };

      applicationRepositoryInstance.createAsync.mockResolvedValue(expectedApplication);

      // Act
      const result = await applicationServiceInstance.createApplication(newAppData);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.CREATED);
      expect(result.success).toBeTruthy();
      expect(result.message).toEqual('Application created');
      expect(result.responseObject).toEqual(expectedApplication);
    });

    it('handles errors for createAsync', async () => {
      // Arrange
      const newAppData = { name: 'Test App', description: 'Test Description' };
      applicationRepositoryInstance.createAsync.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await applicationServiceInstance.createApplication(newAppData);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
      expect(result.message).toEqual('An error occurred while creating the application.');
      expect(result.responseObject).toBeNull();
    });
  });

  describe('updateApplication', () => {
    it('updates an application successfully', async () => {
      // Arrange
      const testId = '1';
      const updatedAppData = { name: 'Updated App' };
      const mockApplication = { ...mockApplications[0], id: testId };
      applicationRepositoryInstance.findByIdAsync.mockResolvedValue(mockApplication);
      applicationRepositoryInstance.updateAsync.mockResolvedValue();

      // Act
      const result = await applicationServiceInstance.updateApplication(testId, updatedAppData);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toEqual('Application updated');
      expect(result.responseObject).toEqual({ ...mockApplication, ...updatedAppData });
    });

    it('returns not found for a non-existent ID', async () => {
      // Arrange
      const testId = '1';
      applicationRepositoryInstance.findByIdAsync.mockResolvedValue(null);

      // Act
      const result = await applicationServiceInstance.updateApplication(testId, {
        name: 'Updated App',
      });

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toEqual('Application not found');
      expect(result.responseObject).toBeNull();
    });

    it('handles errors for updateAsync', async () => {
      // Arrange
      const testId = '1';
      const updatedAppData = { name: 'Updated App' };
      applicationRepositoryInstance.findByIdAsync.mockResolvedValue(mockApplications[0]);
      applicationRepositoryInstance.updateAsync.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await applicationServiceInstance.updateApplication(testId, updatedAppData);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
      expect(result.message).toEqual('An error occurred while updating the application.');
      expect(result.responseObject).toBeNull();
    });
  });

  describe('deleteApplication', () => {
    it('deletes an application successfully', async () => {
      // Arrange
      const testId = '1';
      const mockApplication = mockApplications[0];
      applicationRepositoryInstance.findByIdAsync.mockResolvedValue(mockApplication);
      applicationRepositoryInstance.deleteAsync.mockResolvedValue();

      // Act
      const result = await applicationServiceInstance.deleteApplication(testId);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NO_CONTENT);
      expect(result.success).toBeTruthy();
      expect(result.message).toEqual('Application deleted');
      expect(result.responseObject).toBeNull();
    });

    it('returns not found for a non-existent ID', async () => {
      // Arrange
      const testId = '1';
      applicationRepositoryInstance.findByIdAsync.mockResolvedValue(null);

      // Act
      const result = await applicationServiceInstance.deleteApplication(testId);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toEqual('Application not found');
      expect(result.responseObject).toBeNull();
    });

    it('handles errors for deleteAsync', async () => {
      // Arrange
      const testId = '1';
      applicationRepositoryInstance.findByIdAsync.mockResolvedValue(mockApplications[0]);
      applicationRepositoryInstance.deleteAsync.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await applicationServiceInstance.deleteApplication(testId);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
      expect(result.message).toEqual('An error occurred while deleting the application.');
      expect(result.responseObject).toBeNull();
    });
  });
});
