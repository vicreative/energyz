import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { applications } from '@/api/application/applicationRepository';
import { Application, FindAllApplicationsResponse } from '@/api/application/types';
import type { ServiceResponse } from '@/shared/models/serviceResponse';
import { app } from '@/server';

describe('Application API Endpoints', () => {
  describe('GET /applications', () => {
    it('should return a list of applications', async () => {
      // Arrange
      // Pagination: page, pageSize,
      const page = 1;
      const pageSize = 2;
      // Act
      const response = await request(app).get(`/applications?page=${page}&pageSize=${pageSize}`);
      const responseBody: ServiceResponse<FindAllApplicationsResponse> = response.body;
      const totalRecords = responseBody.responseObject?.count;
      const totalPages = Math.ceil(totalRecords / pageSize);

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('Success');
      expect(responseBody.responseObject?.records.length).toBeLessThanOrEqual(2); // Check pagination
      expect(responseBody.responseObject?.count).toEqual(totalRecords); // Check pagination
      expect(responseBody.responseObject?.totalPages).toEqual(totalPages); // Check total pages
      expect(responseBody.responseObject?.currentPage).toEqual(page); // Check current page
      expect(responseBody.responseObject?.nextPage).toEqual(page < totalPages ? page + 1 : null); // Check next page
      expect(responseBody.responseObject?.prevPage).toEqual(page > 1 ? page - 1 : null); // Check previous page

      // Check for duplicate IDs
      const idSet = new Set();
      const hasDuplicates = responseBody.responseObject.records.some((application) => {
        if (idSet.has(application.id)) {
          return true;
        }
        idSet.add(application.id);
        return false;
      });
      expect(hasDuplicates).toBeFalsy();

      // Compare each application with expected data
      responseBody.responseObject.records.forEach((application, index) =>
        compareApplications(applications[index], application),
      );
    });
  });

  describe('GET /applications/:id', () => {
    it('should return a application for a valid ID', async () => {
      // Arrange
      const testId = '1';
      const expectedApplication = applications.find((application) => application.id === testId);

      // Act
      const response = await request(app).get(`/applications/${testId}`);
      const responseBody: ServiceResponse<Application> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('Application found');
      if (!expectedApplication)
        throw new Error('Invalid test data: expectedApplication is undefined');
      compareApplications(expectedApplication, responseBody.responseObject);
    });

    it('should return a not found error for non-existent ID', async () => {
      // Arrange
      const testId = Number.MAX_SAFE_INTEGER.toString();

      // Act
      const response = await request(app).get(`/applications/${testId}`);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Application not found');
      expect(responseBody.responseObject).toBeNull();
    });

    it('should return a bad request for invalid ID format', async () => {
      // Arrange
      const invalidInput = 'abc';

      // Act
      const response = await request(app).get(`/applications/${invalidInput}`);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Invalid input');
      expect(responseBody.responseObject).toBeNull();
    });
  });

  describe('POST /applications', () => {
    it('should create a new application', async () => {
      // Arrange
      const payload = {
        name: 'New Appplication',
        description: 'This is a new application',
      };
      const expectedResponse = {
        id: '41',
        name: 'New Appplication',
        description: 'This is a new application',
        status: 'in_review',
      };

      // Act
      const response = await request(app).post('/applications').send(payload);
      const responseBody: ServiceResponse<Application> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('Application created');
      expect(responseBody.responseObject).toMatchObject(expectedResponse);
    });

    it('should return a bad request for invalid input', async () => {
      // Arrange
      const invalidInput = {
        name: '',
        description: 'This is a new application',
        status: 'in_review',
      };

      // Act
      const response = await request(app).post('/applications').send(invalidInput);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Invalid input');
      expect(responseBody.responseObject).toBeNull();
    });
  });

  describe('PATCH /applications/:id', () => {
    it('should update an existing application', async () => {
      // Arrange
      const testId = '1';
      const updatedData = {
        name: 'Updated Application',
      };

      // Act
      const response = await request(app).patch(`/applications/${testId}`).send(updatedData);
      const responseBody: ServiceResponse<Application> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('Application updated');
      expect(responseBody.responseObject.name).toEqual(updatedData.name);
    });

    it('should return a bad request for invalid input', async () => {
      // Arrange
      const testId = '1';
      const invalidInput = {
        name: '',
      };

      // Act
      const response = await request(app).patch(`/applications/${testId}`).send(invalidInput);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Invalid input');
      expect(responseBody.responseObject).toBeNull();
    });

    it('should return a not found error for non-existent ID', async () => {
      // Arrange
      const testId = Number.MAX_SAFE_INTEGER.toString();
      const updatedData = {
        name: 'Updated Application',
      };

      // Act
      const response = await request(app).patch(`/applications/${testId}`).send(updatedData);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Application not found');
      expect(responseBody.responseObject).toBeNull();
    });

    it('should return a bad request for invalid ID format', async () => {
      // Arrange
      const testId = 'abc';
      const updatedData = {
        name: 'Updated Application',
      };

      // Act
      const response = await request(app).patch(`/applications/${testId}`).send(updatedData);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Invalid input');
      expect(responseBody.responseObject).toBeNull();
    });
  });

  describe('DELETE /applications/:id', () => {
    it('should delete an application for a valid ID', async () => {
      // Arrange
      const testId = '10';

      // Act
      const response = await request(app).delete(`/applications/${testId}`);

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.NO_CONTENT);
    });

    it('should return a not found error for non-existent ID', async () => {
      // Arrange
      const testId = Number.MAX_SAFE_INTEGER.toString();

      // Act
      const response = await request(app).delete(`/applications/${testId}`);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Application not found');
      expect(responseBody.responseObject).toBeNull();
    });

    it('should return a bad request for invalid ID format', async () => {
      // Arrange
      const testId = 'abc';

      // Act
      const response = await request(app).delete(`/applications/${testId}`);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Invalid input');
      expect(responseBody.responseObject).toBeNull();
    });
  });
});

function compareApplications(mockApplication: Application, responseApplication: Application) {
  if (!mockApplication || !responseApplication) {
    throw new Error('Invalid test data: mockApplication or responseApplication is undefined');
  }

  expect(responseApplication.id).toEqual(mockApplication.id);
  expect(responseApplication.name).toEqual(mockApplication.name);
  expect(responseApplication.description).toEqual(mockApplication.description);
  expect(responseApplication.status).toEqual(mockApplication.status);
}
