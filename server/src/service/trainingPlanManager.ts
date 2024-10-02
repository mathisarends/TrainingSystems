import { Request, Response } from 'express';
import { NotFoundError } from '../errors/notFoundError.js';
import { TrainingPlan } from '../models/training/trainingPlan.js';
import { UUID } from '../models/uuid.js';
import userManager from './userManager.js';

class TrainingPlanManager {
  async findTrainingPlanById(req: Request, res: Response, planId: UUID): Promise<TrainingPlan> {
    const user = await userManager.getUser(req, res);

    const plan = user.trainingPlans.find(plan => plan.id === planId);

    if (!plan) {
      throw new NotFoundError('Plan nicht gefunden');
    }
    return plan;
  }
}

export default new TrainingPlanManager();
