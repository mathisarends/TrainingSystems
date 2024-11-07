import { UserExercise } from '../model/user-exercise.model';

/**
 * Placeholder exercise category to be used when no selection is made.
 */
const placeholder = {
  name: '- Bitte Auswählen -',
  pauseTime: 150,
  defaultSets: 3,
  defaultReps: 10,
  defaultRPE: 8.5,
};

/**
 * List of placeholder exercises.
 */
const placeHolderExercises: UserExercise[] = [
  {
    name: 'Placeholder',
    category: placeholder,
  },
];

export default placeHolderExercises;
