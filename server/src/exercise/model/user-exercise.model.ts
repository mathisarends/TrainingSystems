import { UserExerciseCategory } from '../types/user-exercise-category';

export interface UserExercise {
  name: string;
  maxFactor?: number;
  category: UserExerciseCategory;
}
