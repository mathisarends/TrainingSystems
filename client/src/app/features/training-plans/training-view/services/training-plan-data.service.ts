import { computed, Injectable, signal } from '@angular/core';
import { ExerciseCategories } from '../../model/exercise-categories';
import { Exercise } from '../training-exercise';
import { TrainingPlanDto } from '../trainingPlanDto';

@Injectable({
  providedIn: 'root',
})
export class TrainingPlanDataService {
  title = signal('');
  trainingFrequency = signal(0);
  trainingBlockLength = signal(0);
  exercises = signal<Exercise[]>([]);
  weightRecommendations = signal<string[]>([]);

  weightRecommendationMap = computed(() => this.createWeightRecommendationMap());

  /**
   * Initializes the service state with data from a TrainingPlanDto object.
   */
  initializeFromDto(dto: TrainingPlanDto): void {
    this.title.set(dto.title);
    this.trainingFrequency.set(dto.trainingFrequency);
    this.trainingBlockLength.set(dto.trainingBlockLength);
    this.exercises.set(dto.trainingDay.exercises);
    this.weightRecommendations.set(dto.weightRecommendations);
  }

  /**
   * Adds a new placeholder exercise to the exercises array.
   */
  addExercise(): void {
    const newEntry: Exercise = {
      id: undefined,
      category: ExerciseCategories.PLACEHOLDER,
      exercise: '',
      sets: 0,
      reps: 0,
      weight: undefined,
      targetRPE: 0,
      actualRPE: undefined,
      estMax: 0,
      notes: '',
    };

    this.exercises.update((entries) => [...entries, newEntry]);
  }

  /**
   * Updates a temporary exercise created on the client-side (without an ID) with server-generated values.
   * This ensures the exercise has an ID, enabling actions like deletion or updates by ID.
   */
  findTempEntryAndUpdateWithActualValues(exercise: Exercise): void {
    const tempEntry = this.exercises().find(
      (existingExercise) => existingExercise.category !== ExerciseCategories.PLACEHOLDER && !existingExercise.id,
    );
    if (!tempEntry) {
      return;
    }

    this.exercises.update((entries) =>
      entries.map((entry) => (entry === tempEntry ? { ...entry, ...exercise } : entry)),
    );
  }

  removeLastExercise(): void {
    this.exercises.update((entries) => entries.slice(0, -1));
  }

  hasNoExercises(): boolean {
    return this.exercises().length === 0;
  }

  /**
   * Creates a map of weight recommendations by exercise ID.
   * Returns an empty map if exercises and weightRecommendations are not synchronized.
   */
  private createWeightRecommendationMap(): Map<string, string> {
    const exercises = this.exercises();
    const weightRecommendations = this.weightRecommendations();

    if (!exercises || !weightRecommendations || exercises.length !== weightRecommendations.length) {
      return new Map<string, string>();
    }

    const map = new Map<string, string>();
    exercises.forEach((exercise, index) => {
      if (exercise.id) {
        map.set(exercise.id, weightRecommendations[index] || '');
      }
    });

    return map;
  }
}
