import { Exercise } from '../../models/training/exercise.js';

export class WeightRecommendationService {
  /**
   * Calculates weight recommendations based on the previous training day.
   * @param currentExercises The exercises of the current training day (this week).
   * @param previousExercises The exercises from the previous week's training day.
   */
  static getWeightRecommendations(currentExercises: Exercise[], previousExercises: Exercise[]): string[] {
    return currentExercises.map(currentExercise => {
      const matchingExercise = previousExercises.find(previousExercise => {
        return previousExercise.exercise === currentExercise.exercise && previousExercise.reps === currentExercise.reps;
      });

      return matchingExercise ? matchingExercise.weight : '';
    });
  }
}
