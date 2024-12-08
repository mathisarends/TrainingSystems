import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exercise } from './model/exercise.model';
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
  constructor(@InjectModel(Exercise.name) private readonly exerciseModel: Model<Exercise>) {}

  /**
   * Fetches and prepares all exercises data for the user by their user ID.
   */
  async getExercises(userId: string) {
    const exercises = await this.exerciseModel.find({ userId }).exec();
    if (!exercises || exercises.length === 0) {
      throw new NotFoundException('No exercises found for the given user ID.');
    }

    const { exerciseCategories, categoryPauseTimes, categorizedExercises, defaultRepSchemeByCategory, maxFactors } =
      this.prepareExercisesData(exercises);

    return {
      exerciseCategories,
      categoryPauseTimes,
      categorizedExercises,
      defaultRepSchemeByCategory,
      maxFactors,
    };
  }

  /**
   * Sets or updates the default exercises for a user by their user ID.
   * @param userId - The ID of the user for whom the default exercises are set or updated.
   * @returns The created or updated exercise document.
   */
  async setDefaultExercisesForUser(userId: string) {
    const defaultExercises = this.getDefaultExercisesForUser();

    const updatedExerciseDoc = await this.exerciseModel
      .findOneAndUpdate({ userId }, { $set: { exercises: defaultExercises } }, { new: true, upsert: true })
      .exec();

    return updatedExerciseDoc;
  }

  /**
   * Returns the default exercises organized by category.
   */
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
   * Prepares exercise data for rendering on the client side based on an array of exercises.
   * @param exercises - The exercises array for the user.
   * @returns The structured exercises data.
   */
  private prepareExercisesData(exercises: Exercise[]) {
    const categorizedExercises: Record<string, string[]> = {};
    const categoryPauseTimes: Record<string, number> = {};
    const maxFactors: Record<string, number | undefined> = {};
    const defaultRepSchemeByCategory: Record<string, { defaultSets: number; defaultReps: number; defaultRPE: number }> =
      {};

    exercises.forEach((exerciseDoc) => {
      for (const exercise of Object.values(exerciseDoc.exercises)) {
        exercise.forEach((ex) =>
          this.processExercise(ex, {
            categorizedExercises,
            categoryPauseTimes,
            maxFactors,
            defaultRepSchemeByCategory,
          }),
        );
      }
    });

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
      defaultRepSchemeByCategory: Record<string, { defaultSets: number; defaultReps: number; defaultRPE: number }>;
    },
  ) {
    if (!exercise?.category?.name) {
      console.error('Exercise or exercise category is undefined:', exercise);
      return;
    }

    const { name: categoryName, pauseTime, defaultSets, defaultReps, defaultRPE } = exercise.category;

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
