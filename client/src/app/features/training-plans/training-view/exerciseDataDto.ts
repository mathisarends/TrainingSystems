import { RepSchemeByCategory } from './models/default-rep-scheme-by-category';

export interface ExerciseDataDTO {
  exerciseCategories: string[];
  categoryPauseTimes: { [key: string]: number };
  categorizedExercises: { [key: string]: string[] };
  defaultRepSchemeByCategory: RepSchemeByCategory;
}
