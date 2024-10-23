import { Injectable } from '@nestjs/common';
import { ExerciseCategoryType } from 'src/exercise/types/exercise-category-type.enum';
import { TrainingService } from 'src/training/training.service';

// TODO: diesen service hier implementieren für 'training-statistics-controller'
@Injectable()
export class VolumeStatisticsService {
  constructor(private trainingService: TrainingService) {}

  async getVolumeComparison(
    trainingPlanTitles: string[],
    exerciseCategory: ExerciseCategoryType,
  ) {
    const responseData = await Promise.all(
      trainingPlanTitles.map(async (title) => {
        const trainingPlan = await trainingPlanManager.findTrainingPlanByTitle(
          user,
          title,
        );
        const tonnageProgressionManager = new TonnageProgressionManager(
          trainingPlan,
        );

        return {
          [title]: tonnageProgressionManager.getTonnageProgressionByCategories([
            exerciseCategory,
          ]),
        };
      }),
    );

    const responseObject = Object.assign({}, ...responseData);
  }
}
