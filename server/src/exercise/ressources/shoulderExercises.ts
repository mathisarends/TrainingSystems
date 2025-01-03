import { UserExercise } from '../model/user-exercise.model';
import { UserExerciseCategory } from '../types/user-exercise-category';

/**
 * Shoulder exercise category with default settings.
 */
const Shoulder: UserExerciseCategory = {
  name: 'Shoulder',
  pauseTime: 90,
  defaultSets: 3,
  defaultReps: 12,
  defaultRPE: 8.5,
};

/**
 * List of shoulder exercises.
 */
const shoulderExercises: UserExercise[] = [
  {
    name: 'Reverse Flyes',
    category: Shoulder,
  },
  {
    name: 'Lateral Raise',
    category: Shoulder,
  },
  {
    name: 'Facepulls',
    category: Shoulder,
  },
  {
    name: 'Upright Rows',
    category: Shoulder,
  },
  {
    name: 'Front-Raises',
    category: Shoulder,
  },
];

export default shoulderExercises;
