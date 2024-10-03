/**
 * Represents the overall data structure for a bar chart, combining the x-axis labels
 * with an array of datasets. Each dataset defines its own label, data points, and styling.
 *
 * @property labels - An array of strings representing the categories along the x-axis.
 * @property datasets - An array of datasets, each representing a series of bars in the chart.
 */
export interface BarChartData {
  data: number[];

  label: string;

  backgroundColor: string;
}
