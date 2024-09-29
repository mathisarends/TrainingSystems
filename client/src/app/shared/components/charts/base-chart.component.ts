import { AfterViewInit, Directive, effect, ElementRef, Injector, input, signal, ViewChild } from '@angular/core';
import Chart, { ChartData, ChartType } from 'chart.js/auto';
import { IconName } from '../../icon/icon-name';

@Directive()
export abstract class BaseChartComponent<T extends ChartType> implements AfterViewInit {
  protected readonly IconName = IconName;
  @ViewChild('canvas') canvas!: ElementRef;

  /**
   * The ID used to identify the chart. Defaults to 'chart' if not provided.
   */
  chartId = input<string>('chart');

  /**
   * Input data for the chart, including labels and datasets.
   * The data type is flexible to support different chart types via the generic `T`.
   */
  data = input<ChartData<T>>({ labels: [], datasets: [] });

  /**
   * Title for the Y-axis. This is a required input for all charts.
   */
  yAxisTitle = input<string>();

  /**
   * Signal to hold the chart instance. It is initially set to null and will
   * be populated after the chart is initialized.
   */
  chart = signal<Chart<T> | null>(null);

  constructor(protected injector: Injector) {}

  /**
   * Lifecycle hook that initializes the chart after the view is rendered.
   * It calls the abstract `initializeChart` method which must be implemented by child classes.
   * Also sets up an effect to update the chart whenever the data input changes.
   */
  ngAfterViewInit(): void {
    this.initializeChart();

    effect(
      () => {
        if (this.chart()) {
          this.updateChart();
        }
      },
      { injector: this.injector },
    );
  }

  /**
   * Abstract method that must be implemented by child components to initialize the specific chart type.
   * The method should create and configure a new Chart.js instance.
   */
  protected abstract initializeChart(): void;

  /**
   * Updates the chart's data when the input data changes.
   * It updates both the labels and the datasets of the chart and re-renders it.
   */
  protected updateChart(): void {
    if (this.chart()) {
      this.chart()!.data = this.data();
      this.chart()!.update();
    }
  }

  /**
   * Downloads the chart as a PNG image. It converts the chart to a base64 image string,
   * creates a download link, and triggers the download.
   */
  protected downloadChart(): void {
    const chartInstance = this.chart();
    if (!chartInstance) {
      return;
    }

    const base64Image = chartInstance.toBase64Image();
    const link = document.createElement('a');
    link.href = base64Image;
    link.download = `${this.chartId() || 'chart'}.png`;
    link.click();
  }
}
