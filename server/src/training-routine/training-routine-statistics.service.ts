import { Injectable } from '@nestjs/common';
import { ChartDataDto } from 'src/training/model/chart-data.dto';
import { Exercise } from 'src/training/model/exercise.schema';
import { TrainingRoutine } from './model/training-routine.model';
import { TrainingRoutineViewService } from './training-routine-view.service';

@Injectable()
export class TrainingRoutineStatisticsService {
  constructor(private readonly trainingRoutineViewService: TrainingRoutineViewService) {}

  async getExercisesFromTrainingSession(userId: string, trainingRoutineid: string) {
    const trainingRoutine = await this.trainingRoutineViewService.findTrainingRoutineOrFail(userId, trainingRoutineid);
    return this.getCommonExercisesForAllSessions(trainingRoutine);
  }

  async getTonnageCharts(userId: string, trainingRoutineid: string, exercises: string[]) {
    const trainingRoutine = await this.trainingRoutineViewService.findTrainingRoutineOrFail(userId, trainingRoutineid);

    return this.getTonnageProgressionForExercises(trainingRoutine, exercises);
  }

  async getPerformanceCharts(userId: string, trainingPlanRoutineId: string, exercises: string[]) {
    const trainingRoutine = await this.trainingRoutineViewService.findTrainingRoutineOrFail(
      userId,
      trainingPlanRoutineId,
    );

    return this.getBestPerformanceProgressionForExercises(trainingRoutine, exercises);
  }

  private getCommonExercisesForAllSessions(trainingRoutine: TrainingRoutine) {
    const exerciseSets = trainingRoutine.versions.map(
      (version) => new Set(version.exercises.map((exercise) => exercise.exercise) || []),
    );

    const commonExercises = exerciseSets.reduce(
      (common, set) => new Set([...common].filter((exercise) => set.has(exercise))),
      new Set(exerciseSets[0] || []),
    );

    return Array.from(commonExercises);
  }

  /**
   * Returns the performance progression for each exercise across different versions.
   */
  private getBestPerformanceProgressionForExercises(
    trainingRoutine: TrainingRoutine,
    exercises: string[],
  ): ChartDataDto {
    const responseData: ChartDataDto = {};

    exercises.forEach((exerciseName) => {
      const bestPerformanceArray: number[] = trainingRoutine.versions.map((version) => {
        const relevantExercises = version.exercises.filter((exercise) => exercise.exercise === exerciseName) || [];
        return this.getBestPerformanceForExercises(relevantExercises);
      });

      if (bestPerformanceArray.every((performance) => performance > 0)) {
        responseData[exerciseName] = bestPerformanceArray;
      }
    });

    return responseData;
  }

  private getTonnageProgressionForExercises(trainingRoutine: TrainingRoutine, exercises: string[]): ChartDataDto {
    const responseData: ChartDataDto = {};

    exercises.forEach((exerciseName) => {
      const tonnageArray: number[] = trainingRoutine.versions.map((version) => {
        const relevantExercises = version.exercises.filter((exercise) => exercise.exercise === exerciseName) || [];
        return this.calculateTonnageForExercises(relevantExercises);
      });

      if (tonnageArray.every((tonnage) => tonnage > 0)) {
        responseData[exerciseName] = tonnageArray;
      }
    });

    return responseData;
  }

  /**
   * Calculates the best performance (e.g., estimated max) for the provided exercises.
   */
  private getBestPerformanceForExercises(exercises: Exercise[]): number {
    return exercises.reduce((bestPerformance, exercise) => {
      if (exercise.estMax) {
        return Math.max(bestPerformance, exercise.estMax);
      }
      return bestPerformance;
    }, 0);
  }

  private calculateTonnageForExercises(exercises: Exercise[]): number {
    return exercises.reduce((totalTonnage, exercise) => {
      const weight = parseFloat(exercise.weight) || 0;
      const sets = exercise.sets || 0;
      const reps = exercise.reps || 0;
      return totalTonnage + sets * reps * weight;
    }, 0);
  }
}
