import { AfterViewInit, Directive, effect, ElementRef, Injector, input, signal, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';
import { IconName } from '../../icon/icon-name';
import { ChartData } from './chart-data';

@Directive()
export abstract class BaseChartComponent implements AfterViewInit {
  protected readonly IconName = IconName;
  @ViewChild('canvas') canvas!: ElementRef;

  /**
   * ID used for the chart. Defaults to 'chart' if not provided.
   */
  chartId = input<string>('chart');

  /**
   * Input data for the chart, including labels and datasets.
   */
  data = input<ChartData>({ labels: [], datasets: [] });

  /**
   * Title for the Y-axis, required input.
   */
  yAxisTitle = input.required<string>();

  /**
   * Signal to store the chart instance, initialized as null.
   */
  chart = signal<Chart | null>(null);

  constructor(protected injector: Injector) {}

  /**
   * Lifecycle hook to initialize the chart after the view is loaded.
   * Calls the abstract `initializeChart` method to be implemented in subclasses.
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
   * Abstract method to be implemented by each subclass to initialize the specific chart type.
   */
  protected abstract initializeChart(): void;

  /**
   * Updates the chart with new data when inputs change.
   */
  protected updateChart(): void {
    if (this.chart()) {
      this.chart()!.data.labels = this.data().labels;
      this.chart()!.data.datasets = this.data().datasets;
      this.chart()!.update();
    }
  }

  /**
   * Downloads the chart as a PNG image.
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
