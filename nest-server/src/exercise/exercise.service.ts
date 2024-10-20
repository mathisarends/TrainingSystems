import { Injectable } from '@nestjs/common';
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
