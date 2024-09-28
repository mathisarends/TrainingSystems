import { BarChartDataset } from './bar-chart.-data-set';

/**
 * Represents the overall data structure for a bar chart, combining the x-axis labels
 * with an array of datasets. Each dataset defines its own label, data points, and styling.
 *
 * @property labels - An array of strings representing the categories along the x-axis.
 * @property datasets - An array of datasets, each representing a series of bars in the chart.
 */
export interface BarChartData {
  /**
   * Labels for the x-axis, describing each category or data point.
   * For example: ['January', 'February', 'March']
   */
  labels: string[];

  /**
   * Array of datasets, where each dataset contains a label, data points, and visual styling.
   */
  datasets: BarChartDataset[];
}
