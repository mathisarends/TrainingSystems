import { Injectable } from '@nestjs/common';
import { capitalize } from 'lodash';
import { ExerciseCategoryType } from 'src/exercise/types/exercise-category-type.enum';
import { ChartDataDto } from 'src/training/model/chart-data.dto';
import { TrainingPlan } from 'src/training/model/training-plan.schema';
import { TrainingService } from 'src/training/training.service';

@Injectable()
export class SetProgressionService {
  constructor(private readonly trainingService: TrainingService) {}
  async getSetProgressionByCategories(
    userId: string,
    trainingPlanId: string,
    exerciseCategories: ExerciseCategoryType[],
  ): Promise<ChartDataDto> {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(
      userId,
      trainingPlanId,
    );

    const responseData: ChartDataDto = {};

    exerciseCategories.forEach((category) => {
      responseData[capitalize(category)] = this.getSetsPerWeek(
        trainingPlan,
        category,
      );
    });

    return responseData;
  }

  private getSetsPerWeek(
    trainingPlan: TrainingPlan,
    exerciseCategory: ExerciseCategoryType,
  ): number[] {
    return trainingPlan.trainingWeeks.map((week) =>
      week.trainingDays.reduce(
        (totalSets, trainingDay) =>
          totalSets +
          trainingDay.exercises
            .filter((exercise) => exercise.category === exerciseCategory)
            .reduce((daySets, exercise) => daySets + exercise.sets, 0),
        0,
      ),
    );
  }
}
