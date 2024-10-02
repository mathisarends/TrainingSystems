import { Request, Response } from 'express';
import { User } from '../models/collections/user/user.js';
import { MongoGenericDAO } from '../models/dao/mongo-generic.dao.js';
import { TrainingPlan } from '../models/training/trainingPlan.js';
import { UUID } from '../models/uuid.js';
import userManager from './userManager.js';

class TrainingPlanManager {
  private userDAO!: MongoGenericDAO<User>;

  setUserGenericDAO(userDAO: MongoGenericDAO<User>) {
    this.userDAO = userDAO;
  }

  private async findTrainingPlanById(req: Request, res: Response, planId: UUID): Promise<TrainingPlan | null> {
    const user = await userManager.getUser(req, res);

    if (!user) {
      return null;
    }

    const plan = user.trainingPlans.find(plan => plan.id === planId);

    if (!plan) {
      throw new Error(`Training plan with ID ${planId} not found.`);
    }
    return plan;
  }
}

export default new TrainingPlanManager();
