import { Injectable } from '@nestjs/common';
import { ExerciseCategoryType } from 'src/exercise/types/exercise-category-type.enum';
import { TrainingService } from 'src/training/training.service';
import { TonnageProgressionService } from './tonnage-progression.service';

@Injectable()
export class VolumeStatisticsService {
  constructor(
    private trainingService: TrainingService,
    private tonnageProgressionService: TonnageProgressionService,
  ) {}

  async getVolumeComparison(
    trainingPlanTitles: string[],
    exerciseCategory: ExerciseCategoryType,
  ) {
    const responseData = await Promise.all(
      trainingPlanTitles.map(async (title) => {
        const trainingPlan = await this.trainingService.getPlanByUserAndTitle(
          title,
          exerciseCategory,
        );

        return {
          [title]:
            this.tonnageProgressionService.getTonnageProgressionByCategories(
              trainingPlan,
              [exerciseCategory],
            ),
        };
      }),
    );

    const responseObject = Object.assign({}, ...responseData);
  }
}
