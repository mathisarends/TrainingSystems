import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/user.model';
import { TrainingPlanCardViewDto } from '../model/training-plan-card-view.dto';
import { TrainingPlan } from '../model/training-plan.model';
import { TrainingPlanUtilsService } from './training-plan-utils.service';

@Injectable()
export class TrainingPlanCardViewService {
  constructor(
    @InjectModel(TrainingPlan.name)
    private readonly trainingPlanModel: Model<TrainingPlan>,
    private readonly trainingPlanUtilsService: TrainingPlanUtilsService,
  ) {}

  /**
   * Fetches card views of training plans for a given user by ID.
   * @param userId The ID of the user.
   * @returns An array of training plan card views.
   */
  async getCardViewsForUser(user: User): Promise<TrainingPlanCardViewDto[]> {
    const trainingPlans = await this.trainingPlanModel.find({
      userId: user.id,
    });

    return trainingPlans.map((trainingPlan) =>
      this.createCardView(trainingPlan, user.profilePicture),
    );
  }

  /**
   * Creates a card view for the training plan.
   */
  private createCardView(
    trainingPlan: TrainingPlan,
    pictureUrl?: string,
  ): TrainingPlanCardViewDto {
    return {
      id: trainingPlan.id,
      title: trainingPlan.title,
      blockLength: trainingPlan.trainingWeeks.length,
      weightRecomamndationBase: trainingPlan.weightRecommandationBase,
      trainingFrequency: trainingPlan.trainingFrequency,
      lastUpdated: trainingPlan.lastUpdated,
      coverImageBase64: trainingPlan.coverImageBase64 ?? '',
      pictureUrl: pictureUrl,
      percentageFinished:
        this.getPercentageOfTrainingPlanFinished(trainingPlan),
      averageTrainingDayDuration: this.getAverageTrainingDuration(trainingPlan),
    };
  }

  /**
   * Calculates the percentage of the training plan completed.
   */
  private getPercentageOfTrainingPlanFinished(
    trainingPlan: TrainingPlan,
  ): number {
    const trainingFrequency = trainingPlan.trainingFrequency;
    const totalTrainingDays =
      trainingFrequency * trainingPlan.trainingWeeks.length;
    const { weekIndex, dayIndex } = trainingPlan.mostRecentTrainingDayLocator;

    let completedDays: number;
    if (this.isFirstTrainingDay(weekIndex, dayIndex)) {
      completedDays = 0;
    } else {
      completedDays = weekIndex * trainingFrequency + dayIndex;
    }

    const percentage = (completedDays / totalTrainingDays) * 100;
    return this.roundToNearestStep(percentage, 2.5);
  }

  /**
   * Determines whether the specified week and day are the first training day.
   */
  private isFirstTrainingDay(weekIndex: number, dayIndex: number): boolean {
    return weekIndex === 0 && dayIndex === 0;
  }

  /**
   * Rounds a number to the nearest step value.
   */
  private roundToNearestStep(value: number, step: number): number {
    return Math.round(value / step) * step;
  }

  /**
   * Calculates the average training day duration in a human-readable format.
   */
  private getAverageTrainingDuration(
    trainingPlan: TrainingPlan,
  ): string | undefined {
    const durations: number[] = [];

    for (const week of trainingPlan.trainingWeeks) {
      for (const day of week.trainingDays) {
        if (day.durationInMinutes) {
          durations.push(day.durationInMinutes);
        }
      }
    }

    if (durations.length === 0) {
      return undefined;
    }

    const totalDuration = durations.reduce(
      (sum, duration) => sum + duration,
      0,
    );
    const avgDuration = totalDuration / durations.length;

    const hours = Math.floor(avgDuration / 60);
    const minutes = Math.round(avgDuration % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes} minutes`;
    }
  }
}
