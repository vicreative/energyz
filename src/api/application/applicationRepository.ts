import { loadData } from '@/shared/utils/loadData';
import {
  Application,
  CreateAsyncParams,
  FindAllApplicationsParams,
  FindAllApplicationsResponse,
} from './types';

export const applications: Application[] = loadData(); // Load and deduplicate on startup

let lastId = applications.reduce((max, app) => Math.max(max, parseInt(app.id, 10)), 0);

export class ApplicationRepository {
  async findAllAsync({
    page = 1,
    pageSize = 10,
    filterByName = '',
    filterByStatus = '',
    sortBy = 'name',
    sortOrder = 'asc',
  }: FindAllApplicationsParams): Promise<FindAllApplicationsResponse> {
    let filteredApplications = applications;

    // Filter by name
    if (filterByName) {
      filteredApplications = filteredApplications.filter((app) =>
        app.name.toLowerCase().includes(filterByName.toLowerCase()),
      );
    }

    // Filter by status
    if (filterByStatus) {
      filteredApplications = filteredApplications.filter(
        (app) => app.status.toLowerCase() === filterByStatus.toLowerCase(),
      );
    }

    // Sort applications
    filteredApplications.sort((a, b) => {
      const comparison = a[sortBy].localeCompare(b[sortBy]);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Calculate total pages
    const totalRecords = filteredApplications.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedApplications = filteredApplications.slice(startIndex, startIndex + pageSize);

    return {
      count: totalRecords,
      records: paginatedApplications,
      totalPages,
      currentPage: page,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    };
  }

  async findByIdAsync(id: string): Promise<Application | null> {
    return applications.find((application) => application.id === id) || null;
  }

  async createAsync(payload: CreateAsyncParams): Promise<Application> {
    // Increment the lastId and assign it to the new application
    const id = (++lastId).toString();
    const application = { ...payload, id };

    applications.push(application);
    return application;
  }

  async updateAsync(id: string, updatedApp: Application): Promise<void> {
    const index = applications.findIndex((app) => app.id === id);
    if (index !== -1) {
      applications[index] = updatedApp;
    }
  }

  async deleteAsync(id: string): Promise<void> {
    const index = applications.findIndex((app) => app.id === id);
    if (index !== -1) {
      applications.splice(index, 1);
    }
  }
}
