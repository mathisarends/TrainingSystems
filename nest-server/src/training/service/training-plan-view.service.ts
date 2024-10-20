import { BadRequestException, Injectable } from '@nestjs/common';
import { TrainingDayViewDto } from '../dto/training-day-view.dto';
import { Exercise } from '../model/exercise.schema';
import { TrainingDay } from '../model/training-day.schema';
import { TrainingPlan } from '../model/training-plan.schema';
import { WeightRecommendation } from '../model/weight-recommandation.enum';
import { TrainingService } from '../training.service';

@Injectable()
export class TrainingPlanViewService {
  constructor(private readonly trainingService: TrainingService) {}

  async getTrainingDayView(
    userId: string,
    trainingPlanId: string,
    weekIndex: number,
    dayIndex: number,
  ) {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(
      userId,
      trainingPlanId,
    );

    const trainingDay = this.findAndValidateTrainingDay(
      trainingPlan,
      weekIndex,
      dayIndex,
    );

    let weightRecommandations: string[] = [];

    if (
      trainingPlan.weightRecommandationBase === WeightRecommendation.LASTWEEK &&
      weekIndex > 0
    ) {
      const previousTrainingDay = this.findAndValidateTrainingDay(
        trainingPlan,
        weekIndex - 1,
        dayIndex,
      );

      weightRecommandations = this.getWeightRecommendations(
        trainingDay.exercises,
        previousTrainingDay.exercises,
      );
    }

    return this.toTrainingDayDto(
      trainingPlan,
      trainingDay,
      weightRecommandations,
    );
  }

  private toTrainingDayDto(
    trainingPlan: TrainingPlan,
    trainingDay: TrainingDay,
    weightRecommandations: string[],
  ): TrainingDayViewDto {
    return {
      title: trainingPlan.title,
      trainingFrequency: trainingPlan.trainingFrequency,
      trainingBlockLength: trainingPlan.trainingWeeks.length,
      trainingDay,
      weightRecommandations,
    };
  }

  private getWeightRecommendations(
    currentExercises: Exercise[],
    previousExercises: Exercise[],
  ): string[] {
    return currentExercises.map((currentExercise) => {
      const matchingExercise = previousExercises.find((previousExercise) => {
        return (
          previousExercise.exercise === currentExercise.exercise &&
          previousExercise.reps === currentExercise.reps
        );
      });

      return matchingExercise ? matchingExercise.weight : '';
    });
  }

  private findAndValidateTrainingDay(
    trainingPlan: TrainingPlan,
    weekIndex: number,
    dayIndex: number,
  ): TrainingDay {
    if (weekIndex >= trainingPlan.trainingWeeks.length) {
      throw new BadRequestException('week index is not valid');
    }

    const trainingWeek = trainingPlan.trainingWeeks[weekIndex];
    if (dayIndex >= trainingWeek.trainingDays.length) {
      throw new BadRequestException('day index is not vlaid');
    }

    return trainingWeek.trainingDays[dayIndex];
  }
}
