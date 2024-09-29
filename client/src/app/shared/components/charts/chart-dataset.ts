/**
 * Interface representing a dataset for the line chart.
 *
 * This interface defines the structure of a dataset used in the line chart component.
 * Each dataset corresponds to a specific exercise category or metric and includes
 * necessary properties to render it on the chart.
 */
export interface ChartDataset {
  /**
   * The data points for the dataset, representing the values to be plotted on the chart.
   * Each value corresponds to a data point on the x-axis (e.g., weeks).
   * @example [30, 60, 90]
   */
  data: number[];

  /**
   * The color of the line representing the dataset on the chart.
   * This color is used to draw the line connecting the data points.
   * @example 'rgba(255, 99, 132, 1)'
   */
  borderColor?: string;

  /**
   * The background color used to fill the area beneath the line on the chart.
   * This property is used when the 'fill' option is enabled.
   * @example 'rgba(255, 99, 132, 0.2)'
   */
  backgroundColor?: string | string[];

  /**
   * Determines whether the area under the line should be filled with the background color.
   * Set to `true` to fill the area under the line; otherwise, `false`.
   * @example false
   */
  fill?: boolean;

  label: string;
}

/**
 * Dataset for Line Chart.
 * Specific to "line" charts in Chart.js.
 */
export interface LineChartDataset {
  /**
   * Data points for the line chart.
   */
  data: number[];

  /**
   * Label for the dataset (e.g., "Squats").
   */
  label: string;

  /**
   * Line color connecting the data points.
   */
  borderColor: string;

  /**
   * Background color for the area under the line.
   */
  backgroundColor?: string;

  /**
   * Whether to fill the area under the line with the background color.
   */
  fill?: boolean;
}

/**
 * Dataset for Polar Area Chart.
 * Specific to "polarArea" charts in Chart.js.
 */
export interface PolarAreaChartDataset {
  /**
   * Data points for the polar area chart.
   */
  data: number[];

  /**
   * Label for the dataset (e.g., "Category A").
   */
  label: string;

  /**
   * Background colors for each segment in the polar area chart.
   */
  backgroundColor: string[];
}
