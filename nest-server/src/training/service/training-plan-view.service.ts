import { BadRequestException, Injectable } from '@nestjs/common';
import { TrainingDayViewDto } from '../dto/training-day-view.dto';
import { Exercise } from '../model/exercise.schema';
import { TrainingDay } from '../model/training-day.schema';
import { TrainingPlan } from '../model/training-plan.schema';
import { TrainingWeek } from '../model/training-week.schema';
import { WeightRecommendation } from '../model/weight-recommandation.enum';
import { TrainingService } from '../training.service';

@Injectable()
export class TrainingPlanViewService {
  constructor(private readonly trainingService: TrainingService) {}

  /**
   * Retrieves the training day view for a given plan and user.
   */
  async getTrainingDayView(
    userId: string,
    trainingPlanId: string,
    weekIndex: number,
    dayIndex: number,
  ): Promise<TrainingDayViewDto> {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(
      userId,
      trainingPlanId,
    );

    const trainingDay = this.findAndValidateTrainingDay(
      trainingPlan,
      weekIndex,
      dayIndex,
    );
    const weightRecommendations = this.generateWeightRecommendations(
      trainingPlan,
      weekIndex,
      dayIndex,
      trainingDay,
    );

    return this.toTrainingDayDto(
      trainingPlan,
      trainingDay,
      weightRecommendations,
    );
  }

  /**
   * Validates the training day based on week and day index.
   */
  private findAndValidateTrainingDay(
    trainingPlan: TrainingPlan,
    weekIndex: number,
    dayIndex: number,
  ): TrainingDay {
    const trainingWeek = this.getValidatedTrainingWeek(trainingPlan, weekIndex);
    return this.getValidatedTrainingDay(trainingWeek, dayIndex);
  }

  /**
   * Generates weight recommendations if the plan is set to last week’s weights.
   */
  private generateWeightRecommendations(
    trainingPlan: TrainingPlan,
    weekIndex: number,
    dayIndex: number,
    trainingDay: TrainingDay,
  ): string[] {
    if (this.shouldGenerateWeightRecommendations(trainingPlan, weekIndex)) {
      const previousTrainingDay = this.findAndValidateTrainingDay(
        trainingPlan,
        weekIndex - 1,
        dayIndex,
      );
      return this.getWeightRecommendations(
        trainingDay.exercises,
        previousTrainingDay.exercises,
      );
    }
    return [];
  }

  /**
   * Checks if weight recommendations should be generated.
   */
  private shouldGenerateWeightRecommendations(
    trainingPlan: TrainingPlan,
    weekIndex: number,
  ): boolean {
    return (
      trainingPlan.weightRecommandationBase === WeightRecommendation.LASTWEEK &&
      weekIndex > 0
    );
  }

  /**
   * Maps data to the TrainingDayViewDto object.
   */
  private toTrainingDayDto(
    trainingPlan: TrainingPlan,
    trainingDay: TrainingDay,
    weightRecommendations: string[],
  ): TrainingDayViewDto {
    return {
      title: trainingPlan.title,
      trainingFrequency: trainingPlan.trainingFrequency,
      trainingBlockLength: trainingPlan.trainingWeeks.length,
      trainingDay,
      weightRecommandations: weightRecommendations,
    };
  }

  /**
   * Generates weight recommendations based on previous week's exercises.
   */
  private getWeightRecommendations(
    currentExercises: Exercise[],
    previousExercises: Exercise[],
  ): string[] {
    return currentExercises.map((currentExercise) => {
      const matchingExercise = this.findMatchingExercise(
        currentExercise,
        previousExercises,
      );
      return matchingExercise ? matchingExercise.weight : '';
    });
  }

  /**
   * Finds a matching exercise from the previous week’s training.
   */
  private findMatchingExercise(
    currentExercise: Exercise,
    previousExercises: Exercise[],
  ): Exercise | undefined {
    return previousExercises.find((previousExercise) =>
      this.isMatchingExercise(currentExercise, previousExercise),
    );
  }

  /**
   * Compares two exercises to determine if they are the same.
   */
  private isMatchingExercise(
    currentExercise: Exercise,
    previousExercise: Exercise,
  ): boolean {
    return (
      previousExercise.exercise === currentExercise.exercise &&
      previousExercise.reps === currentExercise.reps
    );
  }

  /**
   * Validates the training week based on index.
   */
  private getValidatedTrainingWeek(
    trainingPlan: TrainingPlan,
    weekIndex: number,
  ) {
    if (weekIndex >= trainingPlan.trainingWeeks.length) {
      throw new BadRequestException('Week index is not valid');
    }
    return trainingPlan.trainingWeeks[weekIndex];
  }

  /**
   * Validates the training day based on index.
   */
  private getValidatedTrainingDay(
    trainingWeek: TrainingWeek,
    dayIndex: number,
  ): TrainingDay {
    if (dayIndex >= trainingWeek.trainingDays.length) {
      throw new BadRequestException('Day index is not valid');
    }
    return trainingWeek.trainingDays[dayIndex];
  }
}
