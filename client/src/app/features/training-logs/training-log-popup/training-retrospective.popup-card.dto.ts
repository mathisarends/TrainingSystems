import { ChartDataDto } from '@shared/charts/chart-data.dto';

export interface TrainingRetrospectivePopupCardInfo {
  tonnage: number;
  tonnageDifferenceFromLastWeek: number;
  durationInMinutes: number;
  durationDifferenceFromLastWeek: number;
  tonnageComparisonOverWeekSpan: ChartDataDto;
  performanceComparisonOverWeekSpan: ChartDataDto;
}
