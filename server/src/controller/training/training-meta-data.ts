import { User } from '../../models/collections/user/user';
import { TrainingDay } from '../../models/training/trainingDay';
/**
 * Class representing training metadata and providing utility methods
 * to access training-related data.
 */
export class TrainingMetaData {
  private user: User;
  private trainingPlanIndex: number;
  private trainingWeekIndex: number;
  private trainingDayIndex: number;

  /**
   * Constructs a TrainingMetaData instance.
   * @param user - The user object containing training plans.
   * @param trainingPlanIndex - Index of the training plan in the user's plans array.
   * @param trainingWeekIndex - Index of the training week in the selected training plan.
   * @param trainingDayIndex - Index of the training day in the selected training week.
   */
  constructor(user: User, trainingPlanIndex: number, trainingWeekIndex: number, trainingDayIndex: number) {
    this.user = user;
    this.trainingPlanIndex = trainingPlanIndex;
    this.trainingWeekIndex = trainingWeekIndex;
    this.trainingDayIndex = trainingDayIndex;
  }

  /**
   * Retrieves the training day object from the user's training plans based on the stored indices.
   * @returns The training day object corresponding to the stored indices.
   */
  getTrainingDay(): TrainingDay {
    return this.user.trainingPlans[this.trainingPlanIndex].trainingWeeks[this.trainingWeekIndex].trainingDays[
      this.trainingDayIndex
    ];
  }

  /**
   * Returns all relevant data as an object.
   * @returns An object containing the user, trainingPlanIndex, trainingWeekIndex, and trainingDayIndex.
   */
  getData() {
    return {
      user: this.user,
      trainingPlanIndex: this.trainingPlanIndex,
      trainingWeekIndex: this.trainingWeekIndex,
      trainingDayIndex: this.trainingDayIndex
    };
  }
}
