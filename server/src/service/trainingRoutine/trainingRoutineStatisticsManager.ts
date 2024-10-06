import { TrainingSession } from '../../models/collections/trainingSession.js';

export class TrainingRoutineStatisticsManager {
  constructor(private trainingSession: TrainingSession) {}

  getCommonExercisesForAllSessions() {
    const exerciseSets = this.trainingSession.versions.map(
      version => new Set(version.exercises?.map(exercise => exercise.exercise) || [])
    );

    const commonExercises = exerciseSets.reduce(
      (common, set) => new Set([...common].filter(exercise => set.has(exercise))),
      new Set(exerciseSets[0] || [])
    );

    return Array.from(commonExercises);
  }
}
