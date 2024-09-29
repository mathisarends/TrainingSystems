import { ChartDataset } from './chart-dataset';

/**
 * Represents the full data structure for a chart, including labels and datasets.
 *
 * @property labels - An array of strings representing the labels on the x-axis (e.g., 'January', 'February').
 * @property datasets - An array of datasets representing the data series to be plotted on the chart.
 */
export interface ChartData {
  /**
   * Labels for the x-axis, describing each category or data point.
   * For example: ['Week 1', 'Week 2', 'Week 3']
   */
  labels: string[];

  /**
   * Array of datasets, where each dataset contains a label (for the legend) and data points to be plotted.
   * For example: [{ label: 'Squats', data: [200, 250, 300] }]
   */
  datasets: ChartDataset[];
}
