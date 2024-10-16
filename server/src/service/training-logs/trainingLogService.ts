import { TrainingDayFinishedNotification } from '../../models/collections/user/training-fninished-notifcation.js';
import { User } from '../../models/collections/user/user.js';
import { TrainingDay } from '../../models/training/trainingDay.js';
import { TrainingDayManager } from '../training-day-manager.js';
import { getTonnagePerTrainingDay } from '../trainingService.js';
import { ExerciseSetCountByCategory } from './categorySetCountMap.js';

class TrainingLogService {
  /**
   * Retrieves the finished training logs for a user, including training tonnage, plan details, and optional image.
   */
  async getUserTrainingLogs(user: User, limit?: number): Promise<TrainingDayFinishedNotification[]> {
    const trainingDays = this.getAllFinishedTrainingSessions(user);

    const trainingLogs = await Promise.all(
      trainingDays.map(async day => {
        const { coverImage, planTitle, tonnage } = await this.getPlanDetails(user, day.id);
        return {
          ...day,
          trainingDayTonnage: getTonnagePerTrainingDay(day),
          coverImage,
          planTitle,
          tonnage
        };
      })
    );

    return trainingLogs.slice(0, limit);
  }

  /**
   * Returns all completed training sessions for the given user, sorted by the end time.
   */
  private getAllFinishedTrainingSessions(user: User): TrainingDay[] {
    return user.trainingPlans
      .flatMap(plan => plan.trainingWeeks)
      .flatMap(week => week.trainingDays)
      .filter(day => !!day.endTime)
      .sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime());
  }

  /**
   * Retrieves the cover image and plan title for a specific training day.
   */
  private async getPlanDetails(
    user: User,
    trainingDayId: string
  ): Promise<{ coverImage: string; planTitle: string; tonnage: number }> {
    const trainingDay = await TrainingDayManager.findTrainingDayById(user, trainingDayId);
    const tonnage = this.getTonnagePerTrainingDay(trainingDay);

    const mostProminentCategoriesInTrainingDay = this.getMostProminentExerciseForTrainingDay(trainingDay);

    return {
      coverImage: this.determineCoverImageBasedOnMostProminentCategory(mostProminentCategoriesInTrainingDay),
      planTitle: mostProminentCategoriesInTrainingDay ?? 'Unknown Plan',
      tonnage: tonnage
    };
  }

  /**
   * Determines the cover image based on the most prominent exercise category.
   */
  private determineCoverImageBasedOnMostProminentCategory(category: string): string {
    const normalizedCategory = category.toLowerCase();

    switch (true) {
      case normalizedCategory.includes('bench'):
        return '/images/summaries/benchpress.webp';
      case normalizedCategory.includes('deadlift'):
        return '/images/summaries/deadlift.webp';
      case normalizedCategory.includes('squat'):
        return '/images/summaries/squat.webp';
      case normalizedCategory.includes('overheadpress'):
        return '/images/summaries/overheadpress2.webp';
      case normalizedCategory.includes('lat'):
        return '/images/summaries/latpulldown.webp';
      default:
        return '/images/training/training_banner-1.webp';
    }
  }

  /**
   * Returns the most prominent exercise categories for a given training day.
   */
  private getMostProminentExerciseForTrainingDay(trainingDay: TrainingDay): string {
    const categorySetCount = this.countSetsPerCategory(trainingDay);

    const mostProminentCategories = this.getCategoriesWithMostSets(categorySetCount);

    return mostProminentCategories.join(' and ');
  }

  /**
   * Counts the number of sets per category for a given training day, giving higher weight to the first two exercises.
   */
  private countSetsPerCategory(trainingDay: TrainingDay): ExerciseSetCountByCategory {
    const categorySetCount: ExerciseSetCountByCategory = {};

    trainingDay.exercises.forEach((exercise, index) => {
      const setCount = index < 2 ? exercise.sets * 2 : exercise.sets; // First two exercises are weighted (for more accurate priority representation)
      categorySetCount[exercise.category] = (categorySetCount[exercise.category] || 0) + setCount;
    });

    return categorySetCount;
  }

  /**
   * Returns the top two categories with the most sets for a given training day.
   */
  private getCategoriesWithMostSets(categorySetCount: ExerciseSetCountByCategory): string[] {
    const sortedCategories = Object.entries(categorySetCount).sort((a, b) => b[1] - a[1]);

    return sortedCategories.slice(0, 2).map(([category]) => category);
  }

  private getTonnagePerTrainingDay(trainingDay: TrainingDay): number {
    let tonnage = 0;

    for (const exercise of trainingDay.exercises) {
      const weight = Number(exercise.weight);

      if (isNaN(weight)) {
        continue;
      }

      const tonnagePerExercise = weight * exercise.sets * exercise.reps;
      tonnage += tonnagePerExercise;
    }

    return tonnage;
  }
}

export default new TrainingLogService();
