import { Injectable, signal } from '@angular/core';
import { ExerciseDataDTO } from './exerciseDataDto';
import { RepSchemeByCategory } from './models/default-rep-scheme-by-category';
import { Exercise } from './training-exercise';

@Injectable({
  providedIn: 'root',
})
export class ExerciseDataService {
  exerciseCategories = signal<string[]>([]);
  categoryPauseTimes = signal<{ [key: string]: number }>({});
  categorizedExercises = signal<{ [key: string]: string[] }>({});
  defaultRepSchemeByCategory = signal<RepSchemeByCategory>({});

  setExerciseData(data: Partial<ExerciseDataDTO>): void {
    this.exerciseCategories.set(data.exerciseCategories || []);
    this.categoryPauseTimes.set(data.categoryPauseTimes || {});
    this.categorizedExercises.set(data.categorizedExercises || {});
    this.defaultRepSchemeByCategory.set(data.defaultRepSchemeByCategory || {});
  }

  /**
   * Retrieves default values for a placeholder category.
   */
  getPlaceholderDefaults(): Partial<Exercise> {
    return {
      sets: 0,
      reps: 0,
      weight: undefined,
      targetRPE: 0,
      actualRPE: undefined,
      estMax: 0,
      notes: '',
    };
  }

  /**
   * Retrieves default values for a given category.
   */
  getCategoryDefaults(category: string): Partial<Exercise> {
    const { defaultSets, defaultReps, defaultRPE } = this.defaultRepSchemeByCategory()[category];
    return {
      sets: defaultSets,
      reps: defaultReps,
      weight: undefined,
      targetRPE: defaultRPE,
      actualRPE: undefined,
      estMax: 0,
      notes: '',
    };
  }

  /**
   * Returns the first available exercise for a given category.
   */
  getFirstExercise(category: string): string {
    return this.categorizedExercises()[category]?.[0] || '';
  }
}
