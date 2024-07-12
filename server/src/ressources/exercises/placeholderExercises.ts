import { Exercise } from '@shared/models/exercise/exercise';

/**
 * Placeholder exercise category to be used when no selection is made.
 */
const placeholder = {
  name: '- Bitte Auswählen -'
};

/**
 * List of placeholder exercises.
 */
const placeHolderExercises: Exercise[] = [
  {
    name: 'Placeholder',
    category: placeholder
  }
];

export default placeHolderExercises;
