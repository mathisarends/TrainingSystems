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
