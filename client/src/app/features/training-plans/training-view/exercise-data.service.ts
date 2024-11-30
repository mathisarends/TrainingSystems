import { Injectable, signal } from '@angular/core';
import { ExerciseDataDTO } from './exerciseDataDto';
import { RepSchemeByCategory } from './models/default-rep-scheme-by-category';

@Injectable()
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
}
