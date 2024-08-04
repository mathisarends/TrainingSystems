import { UserExerciseCategory } from '../../models/collections/user/user-exercise-category.js';
import { UserExercise } from '../../models/collections/user/user-exercise.js';
/**
 * Deadlift exercise category with default settings.
 */
const Deadlift: UserExerciseCategory = {
  name: 'Deadlift',
  pauseTime: 240,
  defaultSets: 3,
  defaultReps: 6,
  defaultRPE: 7
};

/**
 * List of deadlift exercises.
 */
const deadliftExercises: UserExercise[] = [
  {
    name: 'Conventional',
    category: Deadlift
  },
  {
    name: 'Sumo',
    category: Deadlift
  },
  {
    name: 'Paused Deadlift',
    maxFactor: 0.9,
    category: Deadlift
  },
  {
    name: 'Deficit Deadlift',
    maxFactor: 0.9,
    category: Deadlift
  },
  {
    name: 'RDLs',
    maxFactor: 0.825,
    category: Deadlift
  },
  {
    name: 'B-Stance RDLs',
    maxFactor: 0,
    category: Deadlift
  },
  {
    name: 'Stiff-Leg DL',
    maxFactor: 0.825,
    category: Deadlift
  }
];

export default deadliftExercises;
