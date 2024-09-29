import { TrainingSession } from '../../models/training/training-session.js';

/**
 * Interface representing a metadata DTO for a training plan,
 * derived from TrainingSession but without the 'id', 'lastUpdated',
 * and 'recentlyViewedCategoriesInStatisticSection' properties.
 */
export interface TrainingPlanMetaDataDto
  extends Omit<TrainingSession, 'id' | 'lastUpdated' | 'recentlyViewedCategoriesInStatisticSection'> {}
