/**
 * Interface representing exercise data and configuration.
 */
export interface ExerciseDataDTO {
  /**
   * An array of exercise categories.
   */
  exerciseCategories: string[];

  /**
   * An object representing the pause times between exercises for each category.
   * The keys are category names and the values are pause times in seconds.
   */
  categoryPauseTimes: { [key: string]: number };

  /**
   * An object mapping exercise categories to arrays of exercises.
   * The keys are category names and the values are arrays of exercise names.
   */
  categorizedExercises: { [key: string]: string[] };

  /**
   * An object representing the default repetition scheme for each exercise category.
   * The keys are category names and the values are objects specifying default sets, reps, and RPE (Rate of Perceived Exertion).
   */
  defaultRepSchemeByCategory: {
    [key: string]: {
      defaultSets: number;
      defaultReps: number;
      defaultRPE: number;
    };
  };

  /**
   * An object representing factors affecting the maximum performance for exercises.
   * The structure of this object can vary and is flexible.
   */
  maxFactors: any;
}
