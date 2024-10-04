import _ from 'lodash';
import { ChartDataDto } from '../../interfaces/chartDataDto.js';
import { ExerciseCategoryType } from '../../models/training/exercise-category-type.js';
import { TrainingStatisticsManager } from './training-statistics-manager.js';
const { capitalize } = _;

export class SetProgressionManager extends TrainingStatisticsManager {
  getSetProgressionByCategories(exerciseCategories: string[]): ChartDataDto {
    const responseData: ChartDataDto = {};

    const mappedCategories = this.mapExerciseCategoriesToValidCategoryTypes(exerciseCategories);

    mappedCategories.forEach(category => {
      responseData[capitalize(category)] = this.getSetsPerWeek(category);
    });

    return responseData;
  }

  private getSetsPerWeek(exerciseCategory: ExerciseCategoryType): number[] {
    return this.trainingPlan.trainingWeeks.map(week =>
      week.trainingDays.reduce(
        (totalSets, trainingDay) =>
          totalSets +
          trainingDay.exercises
            .filter(exercise => exercise.category === exerciseCategory)
            .reduce((daySets, exercise) => daySets + exercise.sets, 0),
        0
      )
    );
  }
}
