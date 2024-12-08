import { computed, Injectable, signal } from '@angular/core';
import { ExerciseDataDTO } from './exerciseDataDto';
import { Exercise } from './training-exercise';
import { Observable, of, tap } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';

@Injectable({
  providedIn: 'root',
})
export class ExerciseDataService {
  private exerciseData = signal<ExerciseDataDTO | undefined>(undefined);

  exerciseCategories = computed(() => this.exerciseData()?.exerciseCategories || []);
  categoryPauseTimes = computed(() => this.exerciseData()?.categoryPauseTimes || {});
  categorizedExercises = computed(() => this.exerciseData()?.categorizedExercises || {});
  defaultRepSchemeByCategory = computed(() => this.exerciseData()?.defaultRepSchemeByCategory || {});

  constructor(private httpService: HttpService) {}

  /**
   * Loads the exercise data, using cached data if available.
   */
  loadExerciseData(): Observable<ExerciseDataDTO> {
    if (this.exerciseData()) {
      return of(this.exerciseData()!);
    }

    return this.httpService
      .get<ExerciseDataDTO>('/exercise')
      .pipe(tap((exerciseData) => this.exerciseData.set(exerciseData)));
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
