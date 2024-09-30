import { TrainingSessionCardViewDto } from '../../../training-session/model/training-session-card-view-dto';
import { TrainingPlanCardView } from './exercise/training-plan-card-view-dto';

/**
 * Enum representing the types of training plans available.
 */
export enum TrainingPlanType {
  SESSION = 'session',
  PLAN = 'plan',
}

export function isTrainingPlanCardView(
  data: TrainingPlanCardView | TrainingSessionCardViewDto,
): data is TrainingPlanCardView {
  return 'trainingFrequency' in data && 'weightRecomamndationBase' in data;
}

export function isTrainingSessionCardViewDto(
  data: TrainingPlanCardView | TrainingSessionCardViewDto,
): data is TrainingSessionCardViewDto {
  return !('trainingFrequency' in data) && !('weightRecomamndationBase' in data);
}
