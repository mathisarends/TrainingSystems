import { Injectable } from '@nestjs/common';
import { TrainingDayViewDto } from '../dto/training-day-view.dto';
import { Exercise } from '../model/exercise.schema';
import { TrainingDay } from '../model/training-day.schema';
import { TrainingPlan } from '../model/training-plan.model';
import { TrainingPlanViewValidationService } from '../service/training-plan-view-validation.service';
import { TrainingService } from '../training.service';

@Injectable()
export class TrainingPlanViewService {
  constructor(
    private readonly trainingService: TrainingService,
    private readonly trainingPlanViewValidationService: TrainingPlanViewValidationService,
  ) {}

  /**
   * Retrieves the training day view for a given user, training plan, and day.
   */
  async getTrainingDayView(
    userId: string,
    trainingPlanId: string,
    weekIndex: number,
    dayIndex: number,
  ): Promise<TrainingDayViewDto> {
    const trainingPlan = await this.getTrainingPlan(userId, trainingPlanId);
    const trainingDay = this.getValidatedTrainingDay(
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

    return this.mapToTrainingDayDto(
      trainingPlan,
      trainingDay,
      weightRecommendations,
    );
  }

  /**
   * Retrieves and validates the training plan for a user.
   */
  private async getTrainingPlan(
    userId: string,
    trainingPlanId: string,
  ): Promise<TrainingPlan> {
    return this.trainingService.getPlanByUserAndTrainingId(
      userId,
      trainingPlanId,
    );
  }

  /**
   * Validates and retrieves a specific training day from the training plan.
   */
  private getValidatedTrainingDay(
    trainingPlan: TrainingPlan,
    weekIndex: number,
    dayIndex: number,
  ): TrainingDay {
    return this.trainingPlanViewValidationService.findAndValidateTrainingDay(
      trainingPlan,
      weekIndex,
      dayIndex,
    );
  }

  /**
   * Generates weight recommendations based on the previous week's exercises.
   */
  private generateWeightRecommendations(
    trainingPlan: TrainingPlan,
    weekIndex: number,
    dayIndex: number,
    trainingDay: TrainingDay,
  ): string[] {
    if (weekIndex === 0) {
      return [];
    }

    const previousTrainingDay = this.getValidatedTrainingDay(
      trainingPlan,
      weekIndex - 1,
      dayIndex,
    );
    return this.calculateWeightRecommendations(
      trainingDay.exercises,
      previousTrainingDay.exercises,
    );
  }

  /**
   * Maps the training plan and day data to a DTO.
   */
  private mapToTrainingDayDto(
    trainingPlan: TrainingPlan,
    trainingDay: TrainingDay,
    weightRecommendations: string[],
  ): TrainingDayViewDto {
    return {
      title: trainingPlan.title,
      trainingFrequency: trainingPlan.trainingDays.length,
      trainingBlockLength: trainingPlan.trainingWeeks.length,
      trainingDay: trainingDay,
      weightRecommendations: weightRecommendations,
    };
  }

  /**
   * Calculates weight recommendations by comparing current and previous week's exercises.
   */
  private calculateWeightRecommendations(
    currentExercises: Exercise[],
    previousExercises: Exercise[],
  ): string[] {
    return currentExercises.map((currentExercise, index) => {
      const matchingExercise = this.findMatchingExerciseByIndex(
        currentExercise,
        previousExercises,
        index,
      );

      return matchingExercise ? matchingExercise.weight || '' : '';
    });
  }

  /**
   * Finds a matching exercise from the previous week's exercises by index.
   */
  private findMatchingExerciseByIndex(
    currentExercise: Exercise,
    previousExercises: Exercise[],
    index: number,
  ): Exercise | undefined {
    const previousExercise = previousExercises[index];
    if (!previousExercise) {
      return undefined;
    }

    return this.areExercisesMatching(currentExercise, previousExercise)
      ? previousExercise
      : undefined;
  }

  /**
   * Determines if two exercises are considered a match based on their properties.
   */
  private areExercisesMatching(
    currentExercise: Exercise,
    previousExercise: Exercise,
  ): boolean {
    return (
      previousExercise.exercise === currentExercise.exercise &&
      previousExercise.reps === currentExercise.reps
    );
  }
}
