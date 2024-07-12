import { User } from '@shared/models/user.js';
import {
  backExercises,
  benchExercises,
  bicepsExercises,
  chestExercises,
  deadliftExercises,
  legExercises,
  overheadpressExercises,
  placeHolderExercises,
  shoulderExercises,
  squatExercises,
  tricepExercises
} from '../ressources/exerciseCatalog.js';
import { ApiData } from '@shared/models/apiData.js';
import { ExerciseCategory } from '@shared/models/exercise/exerciseCategory.js';
import { Exercise } from '@shared/models/exercise/exercise.js';

export enum ExerciseCategories {
  PLACEHOLDER = '- Bitte Auswählen -',
  SQUAT = 'Squat',
  BENCH = 'Bench',
  DEADLIFT = 'Deadlift',
  OVERHEADPRESS = 'Overheadpress',
  CHEST = 'Chest',
  BACK = 'Back',
  SHOULDER = 'Shoulder',
  TRICEPS = 'Triceps',
  BICEPS = 'Biceps',
  LEGS = 'Legs'
}

/**
 * Prepares exercise data for rendering on the client side.
 */
export function prepareExercisesData(user: User) {
  const categorizedExercises: Record<string, string[]> = {};
  const categoryPauseTimes: Record<string, number> = {};
  const maxFactors: Record<string, number | undefined> = {};
  const defaultRepSchemeByCategory: Record<string, { defaultSets: number; defaultReps: number; defaultRPE: number }> =
    {};

  const allCategorysArray = [
    user.placeholderExercises,
    user.squatExercises,
    user.benchExercises,
    user.deadliftExercises,
    user.overheadpressExercises,
    user.backExercises,
    user.chestExercises,
    user.shoulderExercises,
    user.bicepsExercises,
    user.tricepsExercises,
    user.legExercises
  ];

  for (const categoryArray of allCategorysArray) {
    const exercises = Array.isArray(categoryArray) ? categoryArray : [categoryArray]; // Umwandelung in Array für iteration

    for (const exercise of exercises) {
      if (exercise && exercise.category.name) {
        const categoryName = exercise.category.name;

        if (!categorizedExercises[categoryName]) {
          categorizedExercises[categoryName] = [];
        }
        categorizedExercises[categoryName].push(exercise.name);

        if (!categoryPauseTimes[categoryName]) {
          categoryPauseTimes[categoryName] = exercise.category.pauseTime!;
        }

        // Max Factors pro Übung
        maxFactors[exercise.name] = exercise.maxFactor;

        if (!defaultRepSchemeByCategory[categoryName]) {
          defaultRepSchemeByCategory[categoryName] = {
            defaultSets: exercise.category.defaultSets!,
            defaultReps: exercise.category.defaultReps!,
            defaultRPE: exercise.category.defaultRPE!
          };
        }
      } else {
        // Potential errors:
        // 1. Exercise object might be undefined or null.
        // 2. Exercise object might not have a category.
        // 3. Exercise category might not have a name.
        // Logging can help identify which part is causing the issue.
        console.error('Exercise or exercise category is undefined:', exercise);
      }
    }
  }

  return {
    exerciseCategories: Object.keys(categorizedExercises),
    categoryPauseTimes,
    categorizedExercises,
    defaultRepSchemeByCategory,
    maxFactors
  };
}

/**
 * Maps changed data to categories based on the provided API data.
 */
export function mapChangedDataToCategories(changedData: ApiData): {
  [category: string]: { fieldNames: string[]; newValues: unknown[] };
} {
  const changedCategoriesMap: { [category: string]: { fieldNames: string[]; newValues: unknown[] } } = {};

  Object.entries(changedData).forEach(([fieldName, newValue]) => {
    const categoryIndex: number = isCategoryIndexAboveTen(fieldName)
      ? concatenateNumbers(Number(fieldName.charAt(0)), Number(fieldName.charAt(1)))
      : Number(fieldName.charAt(0));

    const category = getAssociatedCategoryByIndex(categoryIndex);

    if (!changedCategoriesMap[category]) {
      changedCategoriesMap[category] = { fieldNames: [], newValues: [] };
    }

    changedCategoriesMap[category].newValues.push(newValue);
    changedCategoriesMap[category].fieldNames.push(fieldName);
  });

  return changedCategoriesMap;
}

/**
 * Gets the associated category name based on the provided index.
 */
export function getAssociatedCategoryByIndex(index: number) {
  switch (index) {
    case 0:
      return ExerciseCategories.PLACEHOLDER;
    case 1:
      return ExerciseCategories.SQUAT;
    case 2:
      return ExerciseCategories.BENCH;
    case 3:
      return ExerciseCategories.DEADLIFT;
    case 4:
      return ExerciseCategories.OVERHEADPRESS;
    case 5:
      return ExerciseCategories.BACK;
    case 6:
      return ExerciseCategories.CHEST;
    case 7:
      return ExerciseCategories.SHOULDER;
    case 8:
      return ExerciseCategories.BICEPS;
    case 9:
      return ExerciseCategories.TRICEPS;
    case 10:
      return ExerciseCategories.LEGS;
    default:
      throw new Error('Category is not valid');
  }
}

/**
 * Gets the exercise field corresponding to the specified category from the user's data.
 */
export function getExerciseFieldByCategory(category: ExerciseCategories, user: User) {
  switch (category) {
    case ExerciseCategories.SQUAT:
      return user.squatExercises;
    case ExerciseCategories.BENCH:
      return user.benchExercises;
    case ExerciseCategories.DEADLIFT:
      return user.deadliftExercises;
    case ExerciseCategories.OVERHEADPRESS:
      return user.overheadpressExercises;
    case ExerciseCategories.CHEST:
      return user.chestExercises;
    case ExerciseCategories.BACK:
      return user.backExercises;
    case ExerciseCategories.SHOULDER:
      return user.shoulderExercises;
    case ExerciseCategories.TRICEPS:
      return user.tricepsExercises;
    case ExerciseCategories.BICEPS:
      return user.bicepsExercises;
    case ExerciseCategories.LEGS:
      return user.legExercises;
    default:
      throw new Error(`Unknown category: ${category}`);
  }
}

/**
 * Process changes related to exercises based on the provided field name, index, new values, and user exercise field.
 */
export function processExerciseChanges(
  fieldName: string,
  index: number,
  newValues: unknown[],
  userExerciseField: Exercise[]
) {
  if (isExercise(fieldName)) {
    const exerciseIndex: number = isCategoryIndexAboveTen(fieldName)
      ? Number(fieldName.charAt(3))
      : Number(fieldName.charAt(2));

    if (exerciseIndex >= userExerciseField.length) {
      // if it is a new Exercise push it to array
      const exerciseCategoryMetaInfo = getCategoryInfoFromList(userExerciseField)!;
      const newUserExercise = createExerciseObject(exerciseCategoryMetaInfo, newValues[index] as string, undefined);
      userExerciseField.push(newUserExercise);
    } else {
      // else rename it if there is a new value given
      console.log(newValues[index]);
      if (newValues[index]) {
        userExerciseField[exerciseIndex].name = newValues[index] as string;
      } else {
        // value is likely to be an empty string so it can be deleted
        userExerciseField.splice(exerciseIndex, 1);
      }
    }
  } else {
    // means a field which is applied for all exercises of the category
    // was change which means we have to iterate over all fields

    userExerciseField.forEach((exerciseField: Exercise) => {
      switch (true) {
        case fieldName.endsWith('categoryPauseTimeSelect'):
          exerciseField.category.pauseTime = Number(newValues[index]);
          break;
        case fieldName.endsWith('categoryDefaultSetSelect'):
          exerciseField.category.defaultSets = Number(newValues[index]);
          break;
        case fieldName.endsWith('categoryDefaultRepSelect'):
          exerciseField.category.defaultReps = Number(newValues[index]);
          break;
        case fieldName.endsWith('categoryDefaultRPESelect'):
          exerciseField.category.defaultRPE = Number(newValues[index]);
          break;
        default:
          break;
      }
    });
  }
}

/**
 * Creates and returns an exercise object.
 */
export function createExerciseObject(
  category: ExerciseCategory,
  name: string,
  maxFactor: number | undefined
): Exercise {
  const object = {
    category: category,
    name,
    maxFactor
  };

  return object;
}

/**
 * Gets the category information from the first element of a list.
 */
export function getCategoryInfoFromList(exerciseList: Exercise[]) {
  if (exerciseList.length > 0) {
    const firstExercise = exerciseList[0];
    return firstExercise.category;
  } else {
    return null;
  }
}

export function isCategoryIndexAboveTen(fieldName: string) {
  const tensPlaces = Number(fieldName.charAt(0));
  const onesPlaces = Number(fieldName.charAt(1));

  return tensPlaces && !isNaN(onesPlaces);
}

export function concatenateNumbers(num1: number, num2: number) {
  const numeric1 = num1.toString();
  const numeric2 = num2.toString();

  const concatenatedString = numeric1 + numeric2;
  return Number(concatenatedString);
}

export function isExercise(fieldName: string) {
  return fieldName.endsWith('exercise');
}

/**
 * Resets the user's exercises to the default values.
 */
export function resetUserExercises(user: User) {
  user.placeholderExercises = placeHolderExercises;
  user.squatExercises = squatExercises;
  user.benchExercises = benchExercises;
  user.deadliftExercises = deadliftExercises;
  user.overheadpressExercises = overheadpressExercises;
  user.backExercises = backExercises;
  user.chestExercises = chestExercises;
  user.shoulderExercises = shoulderExercises;
  user.bicepsExercises = bicepsExercises;
  user.tricepsExercises = tricepExercises;
  user.legExercises = legExercises;
}
