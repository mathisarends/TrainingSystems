import { User } from '../models/collections/user/user.js';
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
} from '../ressources/exercises/exerciseCatalog.js';
import { ExerciseCategoryType } from '../models/training/exercise-category-type.js';
import { UserExercise } from '../models/collections/user/user-exercise.js';
import { ApiData } from '../models/apiData.js';
import { UserExerciseCategory } from '../models/collections/user/user-exercise-category.js';

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
      return ExerciseCategoryType.PLACEHOLDER;
    case 1:
      return ExerciseCategoryType.SQUAT;
    case 2:
      return ExerciseCategoryType.BENCH;
    case 3:
      return ExerciseCategoryType.DEADLIFT;
    case 4:
      return ExerciseCategoryType.OVERHEADPRESS;
    case 5:
      return ExerciseCategoryType.BACK;
    case 6:
      return ExerciseCategoryType.CHEST;
    case 7:
      return ExerciseCategoryType.SHOULDER;
    case 8:
      return ExerciseCategoryType.BICEPS;
    case 9:
      return ExerciseCategoryType.TRICEPS;
    case 10:
      return ExerciseCategoryType.LEGS;
    default:
      throw new Error('Category is not valid');
  }
}

/**
 * Gets the exercise field corresponding to the specified category from the user's data.
 */
export function getExerciseFieldByCategory(category: ExerciseCategoryType, user: User) {
  switch (category) {
    case ExerciseCategoryType.SQUAT:
      return user.squatExercises;
    case ExerciseCategoryType.BENCH:
      return user.benchExercises;
    case ExerciseCategoryType.DEADLIFT:
      return user.deadliftExercises;
    case ExerciseCategoryType.OVERHEADPRESS:
      return user.overheadpressExercises;
    case ExerciseCategoryType.CHEST:
      return user.chestExercises;
    case ExerciseCategoryType.BACK:
      return user.backExercises;
    case ExerciseCategoryType.SHOULDER:
      return user.shoulderExercises;
    case ExerciseCategoryType.TRICEPS:
      return user.tricepsExercises;
    case ExerciseCategoryType.BICEPS:
      return user.bicepsExercises;
    case ExerciseCategoryType.LEGS:
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
  userExerciseField: UserExercise[]
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

    userExerciseField.forEach((exerciseField: UserExercise) => {
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
  category: UserExerciseCategory,
  name: string,
  maxFactor: number | undefined
): UserExercise {
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
export function getCategoryInfoFromList(exerciseList: UserExercise[]) {
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

export function mapToExerciseCategory(category: string): ExerciseCategoryType {
  switch (category.toLowerCase()) {
    case 'squat':
      return ExerciseCategoryType.SQUAT;
    case 'bench':
      return ExerciseCategoryType.BENCH;
    case 'deadlift':
      return ExerciseCategoryType.DEADLIFT;
    case 'overheadpress':
      return ExerciseCategoryType.OVERHEADPRESS;
    case 'chest':
      return ExerciseCategoryType.CHEST;
    case 'back':
      return ExerciseCategoryType.BACK;
    case 'shoulder':
      return ExerciseCategoryType.SHOULDER;
    case 'triceps':
      return ExerciseCategoryType.TRICEPS;
    case 'biceps':
      return ExerciseCategoryType.BICEPS;
    case 'legs':
      return ExerciseCategoryType.LEGS;
    default:
      throw new Error('Die übergebende Kategorie ist ungültig');
  }
}
