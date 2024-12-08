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
    private trainingPlanViewValidationService: TrainingPlanViewValidationService,
  ) {}

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

    const trainingDay =
      this.trainingPlanViewValidationService.findAndValidateTrainingDay(
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

    await trainingPlan.save();

    return this.toTrainingDayDto(
      trainingPlan,
      trainingDay,
      weightRecommendations,
    );
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
    if (weekIndex > 0) {
      const previousTrainingDay =
        this.trainingPlanViewValidationService.findAndValidateTrainingDay(
          trainingPlan,
          weekIndex,
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
   * Maps data to the TrainingDayViewDto object.
   */
  private toTrainingDayDto(
    trainingPlan: TrainingPlan,
    trainingDay: TrainingDay,
    weightRecommendations: string[],
  ): TrainingDayViewDto {
    return {
      title: trainingPlan.title,
      trainingFrequency: trainingPlan.trainingDays.length,
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
}
