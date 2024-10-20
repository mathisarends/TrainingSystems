import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrainingDay } from './model/training-day.schema';
import { TrainingPlan } from './model/training-plan.schema';

@Injectable()
export class TrainingPlanUtilsService {
  constructor(
    @InjectModel(TrainingPlan.name)
    private readonly trainingPlanModel: Model<TrainingPlan>,
    private readonly configService: ConfigService,
  ) {}

  async getTrainingPlanTitlesForUser(userId: string): Promise<string[]> {
    const trainingPlans = await this.trainingPlanModel.find({ userId });

    return trainingPlans.map((plan) => plan.title);
  }

  async getMostRecentTrainingPlanLink(userId: string): Promise<string> {
    const baseURL = this.configService.get<string>(
      process.env.NODE_ENV === 'development' ? 'DEV_BASE_URL' : 'PROD_BASE_URL',
    );

    const trainingPlans = await this.trainingPlanModel.find({ userId });

    if (!trainingPlans.length) {
      throw new NotFoundException('No training plan for user found');
    }

    const mostRecentPlan = this.getMostRecentPlan(trainingPlans);

    const { weekIndex, dayIndex } =
      this.findLatestTrainingDayWithWeight(mostRecentPlan);

    return `${baseURL}/training/view?planId=${mostRecentPlan.id}&week=${weekIndex}&day=${dayIndex}`;
  }

  /**
   * Finds the most recent plan by sorting.
   */
  private getMostRecentPlan(trainingPlans: TrainingPlan[]): TrainingPlan {
    return trainingPlans.sort(
      (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime(),
    )[0];
  }

  /**
   * Finds the latest training day with a weight by iterating through the flattened list.
   */
  findLatestTrainingDayWithWeight(trainingPlan: TrainingPlan): {
    weekIndex: number;
    dayIndex: number;
  } {
    const flattenedDays = this.flattenTrainingWeeks(trainingPlan);

    const foundDay = flattenedDays.find((trainingDay, index) => {
      const { day } = trainingDay;

      return (
        this.hasWeight(day) && this.isNextDayWithoutWeight(flattenedDays, index)
      );
    });

    return foundDay
      ? { weekIndex: foundDay.weekIndex, dayIndex: foundDay.dayIndex }
      : { weekIndex: 0, dayIndex: 0 };
  }

  /**
   * Flattens the training weeks into a single array of days while retaining indices.
   */
  private flattenTrainingWeeks(
    trainingPlan: TrainingPlan,
  ): { weekIndex: number; dayIndex: number; day: TrainingDay }[] {
    return trainingPlan.trainingWeeks.flatMap((week, weekIndex) =>
      week.trainingDays.map((day, dayIndex) => ({
        weekIndex,
        dayIndex,
        day,
      })),
    );
  }

  /**
   * Checks if the training day contains any exercise with weight.
   */
  private hasWeight(day: TrainingDay): boolean {
    return day.exercises?.some((exercise) => exercise.weight);
  }

  /**
   * Checks if the next day in the flattened array has no weights.
   */
  private isNextDayWithoutWeight(
    flattenedDays: { weekIndex: number; dayIndex: number; day: TrainingDay }[],
    index: number,
  ): boolean {
    const nextIndex = index + 1;
    if (nextIndex < flattenedDays.length) {
      return !this.hasWeight(flattenedDays[nextIndex].day);
    }
    return true;
  }
}
