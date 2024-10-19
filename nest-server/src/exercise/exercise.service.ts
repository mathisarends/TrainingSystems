import { Injectable } from '@nestjs/common';
import { User } from 'src/users/user.model';
import { UserExercise } from './model/user-exercise.model';

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

    console.log(
      '🚀 ~ ExerciseService ~ prepareExercisesData ~ user:',
      user.exercises,
    );

    for (const exercises of Object.values(user.exercises)) {
      console.log(
        '🚀 ~ ExerciseService ~ prepareExercisesData ~ exercises:',
        exercises,
      );
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
