import { TrainingDayFinishedNotification } from '../../models/collections/user/training-fninished-notifcation.js';
import { User } from '../../models/collections/user/user.js';
import { TrainingDay } from '../../models/training/trainingDay.js';
import { TrainingDayManager } from '../training-day-manager.js';
import { getTonnagePerTrainingDay } from '../trainingService.js';

class TrainingLogs {
  async getUserTrainingLogs(user: User, limit?: number): Promise<TrainingDayFinishedNotification[]> {
    const trainingDays = this.getAllFinishedTrainingSessions(user);

    const trainingLogs = await Promise.all(
      trainingDays.map(async day => {
        const { coverImage, planTitle } = await this.getPlanDetails(user, day.id);
        return {
          ...day,
          trainingDayTonnage: getTonnagePerTrainingDay(day),
          coverImage,
          planTitle
        };
      })
    );

    return trainingLogs.slice(0, limit);
  }

  private getAllFinishedTrainingSessions(user: User): TrainingDay[] {
    return user.trainingPlans
      .flatMap(plan => plan.trainingWeeks)
      .flatMap(week => week.trainingDays)
      .filter(day => !!day.endTime)
      .sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime());
  }

  private async getPlanDetails(user: User, trainingDayId: string): Promise<{ coverImage: string; planTitle: string }> {
    const trainingDay = await TrainingDayManager.findTrainingDayById(user, trainingDayId);

    const mostProminentCategoriesInTrainingDay = this.findMostProminentExerciseForTrainingDay(trainingDay);

    return {
      coverImage: this.determineCoverImageBasedOnMostProminentCategory(mostProminentCategoriesInTrainingDay),
      planTitle: mostProminentCategoriesInTrainingDay ?? 'Unknown Plan'
    };
  }

  private determineCoverImageBasedOnMostProminentCategory(category: string): string {
    const imageMap: { [key: string]: string } = {
      bench: '/images/summaries/benchpress.webp',
      deadlift: '/images/summaries/deadlift.webp',
      squat: '/images/summaries/squat.webp',
      overheadpress: '/images/summaries/overheadpress.webp',
      lat: '/images/summaries/latpulldown.webp'
    };

    for (const key in imageMap) {
      if (category.toLowerCase().includes(key)) {
        return imageMap[key];
      }
    }

    return '/images/training/training_banner-1.webp';
  }

  private findMostProminentExerciseForTrainingDay(trainingDay: TrainingDay): string {
    const categorySetCount = this.countSetsPerCategory(trainingDay);

    const mostProminentCategories = this.getCategoriesWithMostSets(categorySetCount);

    return mostProminentCategories.join(' and ');
  }

  private countSetsPerCategory(trainingDay: TrainingDay): { [category: string]: number } {
    const categorySetCount: { [category: string]: number } = {};

    for (const exercise of trainingDay.exercises) {
      categorySetCount[exercise.category] = (categorySetCount[exercise.category] || 0) + exercise.sets;
    }

    return categorySetCount;
  }

  private getCategoriesWithMostSets(categorySetCount: { [category: string]: number }): string[] {
    const sortedCategories = Object.entries(categorySetCount).sort((a, b) => b[1] - a[1]);

    const maxSets = sortedCategories[0][1];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return sortedCategories.filter(([_, sets]) => sets === maxSets).map(([category]) => category);
  }
}

export default new TrainingLogs();
