import { User } from '../models/collections/user/user.js';
import { TrainingDay } from '../models/training/trainingDay.js';
import { TrainingPlan } from '../models/training/trainingPlan.js';
import { TrainingWeek } from '../models/training/trainingWeek.js';

export class TrainingDayManager {
  static async findTrainingDayById(user: User, trainingDayId: string): Promise<TrainingDay | undefined> {
    for (const trainingPlan of user.trainingPlans) {
      const foundDay = this.findTrainingDayInPlan(trainingPlan, trainingDayId);
      if (foundDay) {
        return foundDay;
      }
    }
    return undefined;
  }

  private static findTrainingDayInPlan(trainingPlan: TrainingPlan, trainingDayId: string): TrainingDay | undefined {
    for (const trainingWeek of trainingPlan.trainingWeeks) {
      const foundDay = this.findTrainingDayInWeek(trainingWeek, trainingDayId);
      if (foundDay) {
        return foundDay;
      }
    }
    return undefined;
  }

  private static findTrainingDayInWeek(trainingWeek: TrainingWeek, trainingDayId: string): TrainingDay | undefined {
    return trainingWeek.trainingDays.find(day => day.id === trainingDayId);
  }
}
