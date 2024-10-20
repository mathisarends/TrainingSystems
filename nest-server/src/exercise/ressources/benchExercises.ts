import { UserExercise } from '../model/user-exercise.model';
import { UserExerciseCategory } from '../types/user-exercise-category';
/**
 * Bench press exercise category with default settings.
 */
const Bench: UserExerciseCategory = {
  name: 'Bench',
  pauseTime: 180,
  defaultSets: 4,
  defaultReps: 8,
  defaultRPE: 8,
};

/**
 * List of bench press exercises.
 */
const benchExercises: UserExercise[] = [
  {
    name: 'Comp. Bench',
    category: Bench,
  },
  {
    name: 'Larsen Press',
    maxFactor: 0.95,
    category: Bench,
  },
  {
    name: 'Close Grip Bench',
    maxFactor: 0.95,
    category: Bench,
  },
  {
    name: 'Spoto Bench',
    category: Bench,
  },
  {
    name: 'Tempo Bench',
    maxFactor: 0.95,
    category: Bench,
  },
  {
    name: '3ct Pause Bench',
    maxFactor: 0.95,
    category: Bench,
  },
  {
    name: 'Chestpress',
    maxFactor: 1.1,
    category: Bench,
  },
  {
    name: 'Incline Press',
    maxFactor: 1.1,
    category: Bench,
  },
];

export default benchExercises;
