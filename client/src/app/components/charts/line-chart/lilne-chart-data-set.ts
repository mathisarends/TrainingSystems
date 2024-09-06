/**
 * Interface representing a dataset for the line chart.
 *
 * This interface defines the structure of a dataset used in the line chart component.
 * Each dataset corresponds to a specific exercise category or metric and includes
 * necessary properties to render it on the chart.
 */
export interface LineChartDataset {
  /**
   * The data points for the dataset, representing the values to be plotted on the chart.
   * Each value corresponds to a data point on the x-axis (e.g., weeks).
   * @example [30, 60, 90]
   */
  data: number[];
}
