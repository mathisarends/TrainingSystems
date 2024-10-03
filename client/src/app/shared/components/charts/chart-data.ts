import { BarChartDataset } from './grouped-bar-chart/bar-chart.-data-set';
import { LineChartDataset } from './line-chart/line-chart-data-set';
import { PolarAreaChartDataset } from './polar-chart/polar-area-chart-data-set';

/**
 * Represents the chart data structure, including labels and datasets.
 *
 * @template T - The type of the dataset (e.g., LineChartDataset or PolarAreaChartDataset).
 */
export interface ChartData<T extends LineChartDataset | PolarAreaChartDataset | BarChartDataset> {
  /**
   * X-axis labels for each data point (e.g., ['Week 1', 'Week 2']).
   */
  labels: string[];

  /**
   * Array of datasets, each containing a label and data points.
   * @template T - The specific dataset type (e.g., LineChartDataset[] or PolarAreaChartDataset[]).
   */
  datasets: T[];
}
