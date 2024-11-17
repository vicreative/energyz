import type { Request, Response } from 'express';

import { applicationService } from '@/api/application/applicationService';
import { handleServiceResponse, validateRequest } from '@/shared/utils/httpHandlers';
import { ApplicationsQuerySchema } from './applicationModel';

class ApplicationController {
  public getApplications = async (req: Request, res: Response) => {
    const parsedQuery = ApplicationsQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      return validateRequest(ApplicationsQuerySchema);
    }

    const serviceResponse = await applicationService.findAllApplications(parsedQuery.data);
    return handleServiceResponse(serviceResponse, res);
  };

  public getApplication = async (req: Request, res: Response) => {
    const id = req.params.id;
    const serviceResponse = await applicationService.findApplicationById(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public createApplication = async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const serviceResponse = await applicationService.createApplication({ name, description });
    return handleServiceResponse(serviceResponse, res);
  };

  public updateApplication = async (req: Request, res: Response) => {
    const id = req.params.id;
    const serviceResponse = await applicationService.updateApplication(id, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public deleteApplication = async (req: Request, res: Response) => {
    const id = req.params.id;
    const serviceResponse = await applicationService.deleteApplication(id);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const applicationController = new ApplicationController();
