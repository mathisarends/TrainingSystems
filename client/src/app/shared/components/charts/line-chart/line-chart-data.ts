import { LineChartDataset } from './lilne-chart-data-set';

export interface LineChartData {
  labels: string[]; // Array of labels for the x-axis
  datasets: LineChartDataset[]; // Array of datasets for the chart
}
