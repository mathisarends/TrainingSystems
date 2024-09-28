import { Tonnage } from './tonnage';

/**
 * Represents generic data for different exercise categories, where each category
 * holds an array of a specific type (like Tonnage[] or number[]).
 *
 * @template T - The type of data for each category (e.g., Tonnage[] or number[]).
 */
export interface ExerciseCategoryData<T> {
  squat?: T;
  bench?: T;
  deadlift?: T;
  overheadpress?: T;
  back?: T;
  chest?: T;
  shoulder?: T;
  biceps?: T;
  triceps?: T;
  legs?: T;
}

export type TrainingExerciseTonnageDto = ExerciseCategoryData<Tonnage[]>;

export type SetsResponseDto = ExerciseCategoryData<number[]>;
