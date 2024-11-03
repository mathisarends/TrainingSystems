import { UserExercise } from '../model/user-exercise.model';
import { UserExerciseCategory } from '../types/user-exercise-category';

/**
 * Legs exercise category with default settings.
 */
const Legs: UserExerciseCategory = {
  name: 'Legs',
  pauseTime: 120,
  defaultSets: 3,
  defaultReps: 12,
  defaultRPE: 8.5,
};

/**
 * List of leg exercises.
 */
const legExercises: UserExercise[] = [
  {
    name: 'Hip Thrusts',
    category: Legs,
  },
  {
    name: 'Hyperextensions',
    category: Legs,
  },
  {
    name: 'Leg Extension',
    category: Legs,
  },
  {
    name: 'Leg Curl',
    category: Legs,
  },
  {
    name: 'Calf Raises',
    category: Legs,
  },
  {
    name: 'Hip Adduction',
    category: Legs,
  },
  {
    name: 'Hip Abduction',
    category: Legs,
  },
];

export default legExercises;
