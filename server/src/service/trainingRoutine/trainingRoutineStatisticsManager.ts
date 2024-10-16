import { ChartDataDto } from 'shared/charts/chart-data.dto.js';
import { TrainingSession } from '../../models/collections/trainingSession.js';
import { Exercise } from '../../models/training/exercise.js';

export class TrainingRoutineStatisticsManager {
  constructor(private trainingSession: TrainingSession) {}

  getCommonExercisesForAllSessions() {
    const exerciseSets = this.trainingSession.versions.map(
      version => new Set(version.exercises.map(exercise => exercise.exercise) || [])
    );

    const commonExercises = exerciseSets.reduce(
      (common, set) => new Set([...common].filter(exercise => set.has(exercise))),
      new Set(exerciseSets[0] || [])
    );

    return Array.from(commonExercises);
  }

  /**
   * Returns the performance progression for each exercise across different versions.
   */
  getBestPerformanceProgressionForExercises(exercises: string[]): ChartDataDto {
    const responseData: ChartDataDto = {};

    exercises.forEach(exerciseName => {
      const bestPerformanceArray: number[] = this.trainingSession.versions.map(version => {
        const relevantExercises = version.exercises.filter(exercise => exercise.exercise === exerciseName) || [];
        return this.getBestPerformanceForExercises(relevantExercises);
      });

      if (bestPerformanceArray.every(performance => performance > 0)) {
        responseData[exerciseName] = bestPerformanceArray;
      }
    });

    return responseData;
  }

  getTonnageProgressionForExercises(exercises: string[]): ChartDataDto {
    const responseData: ChartDataDto = {};

    exercises.forEach(exerciseName => {
      const tonnageArray: number[] = this.trainingSession.versions.map(version => {
        const relevantExercises = version.exercises.filter(exercise => exercise.exercise === exerciseName) || [];
        return this.calculateTonnageForExercises(relevantExercises);
      });

      if (tonnageArray.every(tonnage => tonnage > 0)) {
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
