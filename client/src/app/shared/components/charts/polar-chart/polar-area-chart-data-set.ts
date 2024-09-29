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
