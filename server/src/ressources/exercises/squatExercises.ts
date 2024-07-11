import { ExerciseCategory } from '../../models/exercise/exerciseCategory.js';

/**
 * Squat exercise category with default settings.
 */
const Squat: ExerciseCategory = {
  name: 'Squat',
  pauseTime: 240,
  defaultSets: 3,
  defaultReps: 7,
  defaultRPE: 7.5
};

/**
 * List of squat exercises.
 */
const squatExercises = [
  {
    name: 'Lowbar - Squat',
    category: Squat
  },
  {
    name: 'Highbar - Squat',
    category: Squat
  },
  {
    name: 'Paused Squat',
    maxFactor: 0.875,
    category: Squat
  },
  {
    name: 'Tempo Squat (3:1:0)',
    maxFactor: 0.875,
    category: Squat
  },
  {
    name: 'Hack-Squat',
    maxFactor: 1.5,
    category: Squat
  },
  {
    name: 'Bulgurian Split Squats',
    maxFactor: 0,
    category: Squat
  },
  {
    name: 'Legpress',
    maxFactor: 2,
    category: Squat
  }
];

export default squatExercises;
