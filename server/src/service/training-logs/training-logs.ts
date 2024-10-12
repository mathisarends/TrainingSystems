import { TrainingDayFinishedNotification } from '../../models/collections/user/training-fninished-notifcation.js';
import { User } from '../../models/collections/user/user.js';
import { TrainingDay } from '../../models/training/trainingDay.js';
import { getTonnagePerTrainingDay } from '../trainingService.js';

class TrainingLogs {
  getUserTrainingLogs(user: User, limit?: number): TrainingDayFinishedNotification[] {
    const trainingDays = this.getAllFinishedTrainingSessions(user);

    return trainingDays
      .map(day => {
        const { coverImage, planTitle } = this.getPlanDetails(user, day.id);
        return {
          ...day,
          trainingDayTonnage: getTonnagePerTrainingDay(day),
          coverImage,
          planTitle
        };
      })
      .slice(0, limit);
  }

  private getAllFinishedTrainingSessions(user: User): TrainingDay[] {
    return user.trainingPlans
      .flatMap(plan => plan.trainingWeeks)
      .flatMap(week => week.trainingDays)
      .filter(day => !!day.endTime)
      .sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime());
  }

  private getPlanDetails(user: User, trainingDayId: string): { coverImage: string; planTitle: string } {
    const plan = user.trainingPlans.find(trainingPlan =>
      trainingPlan.trainingWeeks.some(week => week.trainingDays.some(day => day.id === trainingDayId))
    );

    return {
      coverImage: plan?.coverImageBase64 ?? '/images/training/training_3.jpg',
      planTitle: plan?.title ?? 'Unknown Plan'
    };
  }
}

export default new TrainingLogs();
