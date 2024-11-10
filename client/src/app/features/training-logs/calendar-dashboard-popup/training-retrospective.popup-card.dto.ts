import { ChartDataDto } from '@shared/charts/chart-data.dto';

export interface TrainingRetrospectivePopupCardInfo {
  tonnageDifferenceFromLastWeek: number;
  durationDifferenceFromLastWeek: number;
  tonnageComparisonOverWeekSpan: ChartDataDto;
  performanceComparisonOverWeekSpan: ChartDataDto;
  tonnage: number;
  durationInMinutes: number;
}
