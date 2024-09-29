import { TrainingSession } from './model/training-session';

/**
 * Interface representing a metadata DTO for a training plan,
 * derived from TrainingSession but without the 'id', 'lastUpdated',
 * and 'recentlyViewedCategoriesInStatisticSection' properties.
 */
export interface TrainingSessionMetaDataDto
  extends Omit<TrainingSession, 'id' | 'lastUpdated' | 'recentlyViewedCategoriesInStatisticSection'> {}
