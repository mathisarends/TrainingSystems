import { TrainingDayCalendarEntry } from './training-day-calendar-entry';

export interface TrainingDayCalendarDataDto {
  finishedTrainings: TrainingDayCalendarEntry[];
  upComingTrainings: TrainingDayCalendarEntry[];
}
