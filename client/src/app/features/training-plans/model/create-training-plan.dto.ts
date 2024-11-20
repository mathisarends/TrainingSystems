export interface CreateTrainingPlanDto {
  /**
   * Holds the title of the training plan.
   */
  title: string;

  /**
   * Holds a set of selected training days.
   */
  trainingDays: string[];

  /**
   * Holds the length of the training block (in weeks).
   */
  trainingBlockLength: number;

  /**
   * Holds the cover image in Base64 format.
   */
  coverImageBase64: string;
}
