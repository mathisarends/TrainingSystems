import { Injectable, NotFoundException } from '@nestjs/common';
import { ExerciseCategoryType } from 'src/exercise/types/exercise-category-type.enum';
import { TrainingService } from 'src/training/training.service'; // Angenommen, dieser Service verwaltet Training-Pläne

@Injectable()
export class RecentlyViewedCategoriesService {
  constructor(private readonly trainingService: TrainingService) {}

  /**
   * Ruft die Liste der kürzlich angesehenen Kategorien für einen bestimmten Trainingsplan ab.
   * @param user Der Benutzer, der den Trainingsplan besitzt
   * @param trainingPlanId Die ID des Trainingsplans
   * @returns Die Liste der kürzlich angesehenen Kategorien
   */
  async getViewedCategories(userId: string, trainingPlanId: string): Promise<string[]> {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(userId, trainingPlanId);

    if (!trainingPlan) {
      throw new NotFoundException('Training plan not found');
    }

    return trainingPlan.recentlyViewedCategoriesInStatisticSection ?? ['Squat', 'Bench', 'Deadlift'];
  }

  /**
   * Aktualisiert die Liste der kürzlich angesehenen Kategorien für einen bestimmten Trainingsplan.
   * @param user Der Benutzer, der den Trainingsplan besitzt
   * @param trainingPlanId Die ID des Trainingsplans
   * @param categories Die Liste der neuen Kategorien
   */
  async updateViewedCategories(
    userId: string,
    trainingPlanId: string,
    exerciseCategories: ExerciseCategoryType[],
  ): Promise<void> {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(userId, trainingPlanId);

    if (!trainingPlan) {
      throw new NotFoundException('Training plan not found');
    }

    trainingPlan.recentlyViewedCategoriesInStatisticSection = exerciseCategories;

    // Speichern des aktualisierten Training-Plans
    await trainingPlan.save();
  }
}
