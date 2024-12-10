import { Injectable } from '@nestjs/common';
import { TrainingPlanViewValidationService } from '../service/training-plan-view-validation.service';
import { TrainingService } from '../training.service';
import { TrainingDayExercisesRearrangementDto } from '../dto/training-day-exercises-rearrangement.dto';
import { Exercise } from '../model/exercise.schema';

/**
 * Service responsible for updating training data for a specific training day within a training plan.
 * Handles the creation, update, and validation of exercises and training days.
 */
@Injectable()
export class TrainingViewExerciseRearrangementService {
  constructor(
    private readonly trainingService: TrainingService,
    private readonly trainingPlanViewValidationService: TrainingPlanViewValidationService,
  ) {}

  async rearrangeExerciseOrder(
    userId: string,
    trainingPlanId: string,
    weekIndex: number,
    dayIndex: number,
    trainingDayExercisesRearrangementDto: TrainingDayExercisesRearrangementDto,
  ) {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(userId, trainingPlanId);

    const trainingDay = this.trainingPlanViewValidationService.findAndValidateTrainingDay(
      trainingPlan,
      weekIndex,
      dayIndex,
    );

    trainingDay.exercises = trainingDayExercisesRearrangementDto.exercises as Exercise[];

    trainingPlan.lastUpdated = new Date();

    trainingPlan.markModified('trainingWeeks');
    await trainingPlan.save();

    // TODO: update for future weeks aswell
  }
}
