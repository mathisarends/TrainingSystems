import { TrainingSessionDto } from './model/training-session-dto';

/**
 * Interface representing a metadata DTO for a training plan,
 * derived from TrainingSession but without the 'id', 'lastUpdated',
 * and 'recentlyViewedCategoriesInStatisticSection' properties.
 */
export interface TrainingSessionMetaDataDto
  extends Omit<
    TrainingSessionDto,
    'id' | 'lastUpdated' | 'recentlyViewedCategoriesInStatisticSection' | 'trainingDays'
  > {}
