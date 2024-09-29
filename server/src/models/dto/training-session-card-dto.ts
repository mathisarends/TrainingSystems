import { TrainingPlanCardViewDto } from './training-plan-card-view-dto.js';

export interface TrainingSessionCardDto
  extends Omit<TrainingPlanCardViewDto, 'blockLength' | 'trainingFrequency' | 'weightRecomamndationBase'> {}
