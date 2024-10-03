import { NotFoundError } from '../errors/notFoundError.js';
import { User } from '../models/collections/user/user.js';
import { TrainingPlan } from '../models/training/trainingPlan.js';
import { UUID } from '../models/uuid.js';

class TrainingPlanManager {
  async findTrainingPlanById(user: User, planId: UUID): Promise<TrainingPlan> {
    return this.findTrainingPlan(user, plan => plan.id === planId);
  }

  async findTrainingPlanByTitle(user: User, title: string): Promise<TrainingPlan> {
    return this.findTrainingPlan(user, plan => plan.title === title);
  }

  private findTrainingPlan(user: User, predicate: (plan: TrainingPlan) => boolean): TrainingPlan {
    const plan = user.trainingPlans.find(predicate);

    if (!plan) {
      throw new NotFoundError('Plan nicht gefunden');
    }
    return plan;
  }
}

export default new TrainingPlanManager();
