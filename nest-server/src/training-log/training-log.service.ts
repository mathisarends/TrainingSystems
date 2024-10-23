import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrainingDay } from 'src/training/model/training-day.schema';
import { TrainingPlan } from 'src/training/model/training-plan.schema';
import { TrainingService } from 'src/training/training.service';
import { TrainingLogNotification } from './model/training-log.model';
import { TrainingDayService } from './training-day.service';

interface ExerciseSetCountByCategory {
  [category: string]: number;
}

@Injectable()
export class TrainingLogService {
  constructor(
    private readonly trainingService: TrainingService,
    private readonly trainingDayService: TrainingDayService,
    @InjectModel(TrainingLogNotification.name)
    private readonly trainingLogModel: Model<TrainingLogNotification>,
  ) {}

  async getAmoutOFTrainingLogNotificationsByUserId(userId: string) {
    const logs = await this.trainingLogModel.find({ userId }).exec();
    return logs.length;
  }

  /**
   * Löscht alle Logs eines Benutzers.
   * @param userId Die ID des Benutzers
   * @returns Anzahl der gelöschten Logs
   */
  async deleteLogsByUser(userId: string) {
    const deleteResult = await this.trainingLogModel
      .deleteMany({ userId })
      .exec();

    return deleteResult.deletedCount;
  }

  async getTrainingLogsByUserId(userId: string) {
    const trainingPlans =
      await this.trainingService.getTrainingPlansByUser(userId);

    const finishedTrainingSessions =
      this.getAllFinishedTrainingSessions(trainingPlans);

    return await Promise.all(
      finishedTrainingSessions.map(async (day) => {
        const { coverImage, planTitle } = await this.getPlanDetails(
          day.id,
          trainingPlans,
        );
        return {
          ...day,
          coverImage,
          planTitle,
        };
      }),
    );
  }

  private getAllFinishedTrainingSessions(
    trainingPlans: TrainingPlan[],
  ): TrainingDay[] {
    return trainingPlans
      .flatMap((plan) => plan.trainingWeeks)
      .flatMap((week) => week.trainingDays)
      .filter((day) => !!day.endTime)
      .sort(
        (a, b) =>
          new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime(),
      );
  }

  async getPlanDetails(
    trainingDayId: string,
    trainingPlans: TrainingPlan[],
  ): Promise<{ coverImage: string; planTitle: string }> {
    const trainingDay = await this.trainingDayService.findTrainingDayById(
      trainingPlans,
      trainingDayId,
    );

    const mostProminentCategoriesInTrainingDay =
      this.getMostProminentExerciseForTrainingDay(trainingDay);

    return {
      coverImage: this.determineCoverImageBasedOnMostProminentCategory(
        mostProminentCategoriesInTrainingDay,
      ),
      planTitle: mostProminentCategoriesInTrainingDay ?? 'Unknown Plan',
    };
  }

  /**
   * Determines the cover image based on the most prominent exercise category.
   */
  private determineCoverImageBasedOnMostProminentCategory(
    category: string,
  ): string {
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
  private getMostProminentExerciseForTrainingDay(
    trainingDay: TrainingDay,
  ): string {
    const categorySetCount = this.countSetsPerCategory(trainingDay);

    const mostProminentCategories =
      this.getCategoriesWithMostSets(categorySetCount);

    return mostProminentCategories.join(' and ');
  }

  /**
   * Counts the number of sets per category for a given training day, giving higher weight to the first two exercises.
   */
  private countSetsPerCategory(
    trainingDay: TrainingDay,
  ): ExerciseSetCountByCategory {
    const categorySetCount: ExerciseSetCountByCategory = {};

    trainingDay.exercises.forEach((exercise, index) => {
      const setCount = index < 2 ? exercise.sets * 2 : exercise.sets; // First two exercises are weighted (for more accurate priority representation)
      categorySetCount[exercise.category] =
        (categorySetCount[exercise.category] || 0) + setCount;
    });

    return categorySetCount;
  }

  /**
   * Returns the top two categories with the most sets for a given training day.
   */
  private getCategoriesWithMostSets(
    categorySetCount: ExerciseSetCountByCategory,
  ): string[] {
    const sortedCategories = Object.entries(categorySetCount).sort(
      (a, b) => b[1] - a[1],
    );

    return sortedCategories.slice(0, 2).map(([category]) => category);
  }
}
