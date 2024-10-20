import { Injectable } from '@nestjs/common';
import { ApiData } from 'src/types/api-data';
import { User } from 'src/users/user.model';
import { UserExercise } from './model/user-exercise.model';
import backExercises from './ressources/backExercises';
import benchExercises from './ressources/benchExercises';
import bicepsExercises from './ressources/bicepsExercises';
import chestExercises from './ressources/chestExercises';
import deadliftExercises from './ressources/deadliftExercises';
import legExercises from './ressources/legExercises';
import overheadpressExercises from './ressources/overheadpressExercises';
import placeHolderExercises from './ressources/placeholderExercises';
import shoulderExercises from './ressources/shoulderExercises';
import squatExercises from './ressources/squatExercises';
import tricepExercises from './ressources/tricepsExercises';
import { ExerciseCategoryType } from './types/exercise-category-type.enum';
import { UserExerciseCategory } from './types/user-exercise-category';

@Injectable()
export class ExerciseService {
  /**
   * Fetches and prepares all exercises data for the user.
   */
  getExercises(user: User) {
    const {
      exerciseCategories,
      categoryPauseTimes,
      categorizedExercises,
      defaultRepSchemeByCategory,
      maxFactors,
    } = this.prepareExercisesData(user);

    return {
      exerciseCategories,
      categoryPauseTimes,
      categorizedExercises,
      defaultRepSchemeByCategory,
      maxFactors,
    };
  }

  async updateExercisesForUser(user: User, changedData: ApiData) {
    const changedCategoriesMap = this.mapChangedDataToCategories(changedData);

    Object.entries(changedCategoriesMap).forEach(
      ([category, { fieldNames, newValues }]) => {
        const userExerciseField = this.getExerciseFieldByCategory(
          category as ExerciseCategoryType,
          user,
        );

        for (let index = 0; index < fieldNames.length; index++) {
          this.processExerciseChanges(
            fieldNames[index],
            index,
            newValues,
            userExerciseField,
          );
        }
      },
    );

    await user.save();
  }

  /**
   * Maps changed data to categories based on the provided API data.
   */
  private mapChangedDataToCategories(changedData: ApiData): {
    [category: string]: { fieldNames: string[]; newValues: unknown[] };
  } {
    const changedCategoriesMap: {
      [category: string]: { fieldNames: string[]; newValues: unknown[] };
    } = {};

    Object.entries(changedData).forEach(([fieldName, newValue]) => {
      const categoryIndex: number = this.isCategoryIndexAboveTen(fieldName)
        ? this.concatenateNumbers(
            Number(fieldName.charAt(0)),
            Number(fieldName.charAt(1)),
          )
        : Number(fieldName.charAt(0));

      const category = this.getAssociatedCategoryByIndex(categoryIndex);

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
  getAssociatedCategoryByIndex(index: number) {
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

  private isCategoryIndexAboveTen(fieldName: string) {
    const tensPlaces = Number(fieldName.charAt(0));
    const onesPlaces = Number(fieldName.charAt(1));

    return tensPlaces && !isNaN(onesPlaces);
  }

  private concatenateNumbers(num1: number, num2: number) {
    const numeric1 = num1.toString();
    const numeric2 = num2.toString();

    const concatenatedString = numeric1 + numeric2;
    return Number(concatenatedString);
  }

  /**
   * Gets the exercise field corresponding to the specified category from the user's data.
   */
  private getExerciseFieldByCategory(
    category: ExerciseCategoryType,
    user: User,
  ) {
    const exercises = user.exercises[category];

    if (!exercises) {
      throw new Error(`Unknown category: ${category}`);
    }

    return exercises;
  }

  /**
   * Process changes related to exercises based on the provided field name, index, new values, and user exercise field.
   */
  private processExerciseChanges(
    fieldName: string,
    index: number,
    newValues: unknown[],
    userExerciseField: UserExercise[],
  ) {
    if (this.isExercise(fieldName)) {
      const exerciseIndex: number = this.isCategoryIndexAboveTen(fieldName)
        ? Number(fieldName.charAt(3))
        : Number(fieldName.charAt(2));

      if (exerciseIndex >= userExerciseField.length) {
        const exerciseCategoryMetaInfo =
          this.getCategoryInfoFromList(userExerciseField)!;
        const newUserExercise = this.createExerciseObject(
          exerciseCategoryMetaInfo,
          newValues[index] as string,
          undefined,
        );
        userExerciseField.push(newUserExercise);
      } else {
        console.log(newValues[index]);
        if (newValues[index]) {
          userExerciseField[exerciseIndex].name = newValues[index] as string;
        } else {
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
  private createExerciseObject(
    category: UserExerciseCategory,
    name: string,
    maxFactor: number | undefined,
  ): UserExercise {
    const object = {
      category: category,
      name,
      maxFactor,
    };

    return object;
  }

  getCategoryInfoFromList(exerciseList: UserExercise[]) {
    if (exerciseList.length === 0) {
      return null;
    }

    const firstExercise = exerciseList[0];
    return firstExercise.category;
  }

  private isExercise(fieldName: string) {
    return fieldName.endsWith('exercise');
  }

  async setDefaultExercisesForUser(user: User) {
    user.exercises = this.getDefaultExercisesForUser();

    return await user.save();
  }

  getDefaultExercisesForUser() {
    return {
      [ExerciseCategoryType.PLACEHOLDER]: placeHolderExercises,
      [ExerciseCategoryType.SQUAT]: squatExercises,
      [ExerciseCategoryType.BENCH]: benchExercises,
      [ExerciseCategoryType.DEADLIFT]: deadliftExercises,
      [ExerciseCategoryType.OVERHEADPRESS]: overheadpressExercises,
      [ExerciseCategoryType.CHEST]: chestExercises,
      [ExerciseCategoryType.BACK]: backExercises,
      [ExerciseCategoryType.SHOULDER]: shoulderExercises,
      [ExerciseCategoryType.TRICEPS]: tricepExercises,
      [ExerciseCategoryType.BICEPS]: bicepsExercises,
      [ExerciseCategoryType.LEGS]: legExercises,
    };
  }

  /**
   * Prepares exercise data for rendering on the client side.
   */
  private prepareExercisesData(user: User) {
    const categorizedExercises: Record<string, string[]> = {};
    const categoryPauseTimes: Record<string, number> = {};
    const maxFactors: Record<string, number | undefined> = {};
    const defaultRepSchemeByCategory: Record<
      string,
      { defaultSets: number; defaultReps: number; defaultRPE: number }
    > = {};

    for (const exercises of Object.values(user.exercises)) {
      exercises.forEach((exercise) =>
        this.processExercise(exercise, {
          categorizedExercises,
          categoryPauseTimes,
          maxFactors,
          defaultRepSchemeByCategory,
        }),
      );
    }

    return {
      exerciseCategories: Object.keys(categorizedExercises),
      categoryPauseTimes,
      categorizedExercises,
      defaultRepSchemeByCategory,
      maxFactors,
    };
  }

  /**
   * Processes a single exercise and updates the exercise data structures.
   */
  private processExercise(
    exercise: UserExercise | undefined,
    {
      categorizedExercises,
      categoryPauseTimes,
      maxFactors,
      defaultRepSchemeByCategory,
    }: {
      categorizedExercises: Record<string, string[]>;
      categoryPauseTimes: Record<string, number>;
      maxFactors: Record<string, number | undefined>;
      defaultRepSchemeByCategory: Record<
        string,
        { defaultSets: number; defaultReps: number; defaultRPE: number }
      >;
    },
  ) {
    if (!exercise?.category?.name) {
      console.error('Exercise or exercise category is undefined:', exercise);
      return;
    }

    const {
      name: categoryName,
      pauseTime,
      defaultSets,
      defaultReps,
      defaultRPE,
    } = exercise.category;

    if (!categorizedExercises[categoryName]) {
      categorizedExercises[categoryName] = [];
      categoryPauseTimes[categoryName] = pauseTime!;
      defaultRepSchemeByCategory[categoryName] = {
        defaultSets: defaultSets!,
        defaultReps: defaultReps!,
        defaultRPE: defaultRPE!,
      };
    }

    categorizedExercises[categoryName].push(exercise.name);
    maxFactors[exercise.name] = exercise.maxFactor;
  }
}