import { NotFoundError } from '../errors/notFoundError.js';
import { User } from '../models/collections/user/user.js';
import { TrainingPlan } from '../models/training/trainingPlan.js';
import { UUID } from '../models/uuid.js';

class TrainingPlanManager {
  async findTrainingPlanById(user: User, planId: UUID): Promise<TrainingPlan> {
    const plan = user.trainingPlans.find(plan => plan.id === planId);

    if (!plan) {
      throw new NotFoundError('Plan nicht gefunden');
    }
    return plan;
  }
}

export default new TrainingPlanManager();
