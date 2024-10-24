import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExerciseCategoryType } from 'src/exercise/types/exercise-category-type.enum';
import { AutoProgressionDto } from '../dto/auto-progression.dto';
import { TrainingDay } from '../model/training-day.schema';
import { TrainingPlan } from '../model/training-plan.schema';
import { TrainingService } from '../training.service';

@Injectable()
export class TrainingPlanUtilsService {
  constructor(
    @InjectModel(TrainingPlan.name)
    private readonly trainingPlanModel: Model<TrainingPlan>,
    private readonly trainingService: TrainingService,
    private readonly configService: ConfigService,
  ) {}

  async handleAutoProgressionForTrainingPlan(
    userId: string,
    trainingPlanId: string,
    autoProgressionDto: AutoProgressionDto,
  ) {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(
      userId,
      trainingPlanId,
    );

    trainingPlan.trainingWeeks.forEach((trainingWeek, weekIndex) => {
      if (
        autoProgressionDto.withDeloadWeek &&
        this.isLastWeek(trainingPlan, weekIndex)
      ) {
        this.handleDeloadWeek(trainingPlan, weekIndex);
      } else if (weekIndex !== 0) {
        this.adjustRPEForWeek(
          trainingPlan,
          weekIndex,
          autoProgressionDto.rpeProgression,
        );
      }
    });
  }

  async getTrainingPlanTitlesForUser(userId: string): Promise<string[]> {
    const trainingPlans = await this.trainingPlanModel.find({ userId });

    return trainingPlans.map((plan) => plan.title);
  }

  async getTrainingPlanTitleById(
    userId: string,
    trainingPlanId: string,
  ): Promise<string> {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(
      userId,
      trainingPlanId,
    );

    return trainingPlan.title;
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

  private isLastWeek(trainingPlan: TrainingPlan, weekIndex: number): boolean {
    return trainingPlan.trainingWeeks.length - 1 === weekIndex;
  }

  private handleDeloadWeek(
    trainingPlan: TrainingPlan,
    weekIndex: number,
  ): void {
    const lastTrainingWeek = trainingPlan.trainingWeeks[weekIndex - 1];
    const deloadTrainingWeek = trainingPlan.trainingWeeks[weekIndex];

    deloadTrainingWeek.trainingDays.forEach((trainingDay, dayIndex) => {
      const trainingDayBeforeDeload = lastTrainingWeek.trainingDays[dayIndex];

      trainingDay.exercises.forEach((exercise, exerciseIndex) => {
        const exerciseBeforeDeload =
          trainingDayBeforeDeload.exercises[exerciseIndex];

        if (exercise.exercise === exerciseBeforeDeload.exercise) {
          exercise.sets = Math.max(exerciseBeforeDeload.sets - 1, 0);
          exercise.targetRPE = this.isMainCategory(exercise.category)
            ? '6'
            : '7';
        }
      });
    });
  }

  private isMainCategory(category: string): boolean {
    return (
      category === ExerciseCategoryType.SQUAT ||
      category === ExerciseCategoryType.BENCH ||
      category === ExerciseCategoryType.DEADLIFT
    );
  }

  private adjustRPEForWeek(
    trainingPlan: TrainingPlan,
    weekIndex: number,
    rpeIncrease: number,
  ): void {
    const previousTrainingWeek = trainingPlan.trainingWeeks[weekIndex - 1];

    trainingPlan.trainingWeeks[weekIndex].trainingDays.forEach(
      (trainingDay, dayIndex) => {
        const previousWeekTrainingDay =
          previousTrainingWeek.trainingDays[dayIndex];

        trainingDay.exercises.forEach((exercise, exerciseIndex) => {
          const previousWeekExercise =
            previousWeekTrainingDay?.exercises[exerciseIndex];

          if (exercise.exercise === previousWeekExercise?.exercise) {
            if (Number(previousWeekExercise.targetRPE)) {
              const rpeMax = this.isMainCategory(exercise.category) ? 9 : 10;
              const parsedRPE = Number(previousWeekExercise.targetRPE);
              exercise.targetRPE = Math.min(
                parsedRPE + rpeIncrease,
                rpeMax,
              ).toString();
            } else {
              const rpeArray = this.parseStringToNumberArray(
                previousWeekExercise.targetRPE,
              );

              if (rpeArray) {
                const rpeMax = this.isMainCategory(exercise.category) ? 9 : 10;
                const adjustedRpeArray = rpeArray.map((rpe) =>
                  Math.min(rpe + rpeIncrease, rpeMax),
                );
                exercise.targetRPE = adjustedRpeArray.join(';');
              } else {
                console.warn(
                  `Cannot parse targetRPE for exercise: ${exercise.exercise}`,
                );
              }
            }
          }
        });
      },
    );
  }

  private parseStringToNumberArray(
    value: string,
    delimiter: string = ';',
  ): number[] | null {
    const parts = value.split(delimiter);
    const numbers = parts.map((part) => Number(part.trim()));

    if (numbers.every((num) => !isNaN(num))) {
      return numbers;
    }
    return null;
  }
}
