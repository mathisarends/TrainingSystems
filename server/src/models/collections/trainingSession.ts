import { TrainingDay } from '../training/trainingDay.js';
import { TrainingPlan } from '../training/trainingPlan.js';
import { Entity } from './entity.js';

/**
 * Interface representing a training session, derived from TrainingPlan but without trainingWeeks.
 */
export interface TrainingSession extends Entity, Omit<TrainingPlan, 'id' | 'trainingWeeks' | 'trainingFrequency'> {
  userId: string;

  versions: TrainingDay[];
}
