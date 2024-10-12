import { TrainingDayFinishedNotification } from '../../models/collections/user/training-fninished-notifcation.js';
import { User } from '../../models/collections/user/user.js';
import { TrainingDay } from '../../models/training/trainingDay.js';
import { getTonnagePerTrainingDay } from '../trainingService.js';

class TrainingLogs {
  getUserTrainingLogs(user: User): TrainingDayFinishedNotification[] {
    const trainingDays = this.getAllFinishedTrainingSessions(user);

    return trainingDays.map(day => ({
      ...day,
      trainingDayTonnage: getTonnagePerTrainingDay(day),
      coverImage: this.getCoverImageFromPlan(user, day.id)
    }));
  }

  private getAllFinishedTrainingSessions(user: User): TrainingDay[] {
    return user.trainingPlans
      .flatMap(plan => plan.trainingWeeks)
      .flatMap(week => week.trainingDays)
      .filter(day => !!day.endTime); // Only include training days that are finished
  }

  private getCoverImageFromPlan(user: User, trainingDayId: string): string {
    const plan = user.trainingPlans.find(trainingPlan =>
      trainingPlan.trainingWeeks.some(week => week.trainingDays.some(day => day.id === trainingDayId))
    );

    return plan?.coverImageBase64 ?? '/images/training/training_3.jpg';
  }
}

export default new TrainingLogs();
