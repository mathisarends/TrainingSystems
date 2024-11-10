/**
 * Represents a single dataset in a bar chart, including the data points
 * and visual styling (such as colors and border width).
 *
 * @property label - The name of the dataset (appears in the chart legend).
 * @property data - An array of numbers representing the data points to be plotted for this dataset.
 * @property backgroundColor - The color used to fill the bars for this dataset.
 * @property borderColor - The color used for the border around the bars.
 * @property borderWidth - The thickness of the border around each bar.
 */
export interface BarChartDataset {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor?: string;
}
