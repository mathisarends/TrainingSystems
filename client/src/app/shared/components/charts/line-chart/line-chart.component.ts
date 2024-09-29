import { AfterViewInit, Component, effect, ElementRef, Injector, input, signal, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { IconName } from '../../../icon/icon-name';
import { CircularIconButtonComponent } from '../../circular-icon-button/circular-icon-button.component';
import { LineChartData } from './line-chart-data';

@Component({
  selector: 'app-line-chart',
  imports: [CircularIconButtonComponent, TooltipDirective],
  standalone: true,
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent implements AfterViewInit {
  protected readonly IconName = IconName;
  @ViewChild('canvas') canvas!: ElementRef;

  /**
   * ID used for the chart. Defaults to 'lineChart' if not provided.
   */
  chartId = input<string>('lineChart');

  /**
   * Input data for the chart, including labels and datasets.
   */
  data = input<LineChartData>({ labels: [], datasets: [] });

  /**
   * Title for the Y-axis, required input.
   */
  yAxisTitle = input.required<string>();

  /**
   * Signal to store the chart instance, initialized as null.
   */
  chart = signal<Chart<'line'> | null>(null);

  constructor(private injector: Injector) {}

  /**
   * Lifecycle hook to initialize the chart after the view is loaded.
   * Sets up reactive updates when input data changes.
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
   * Initializes the line chart. Destroys any existing chart to prevent memory leaks.
   */
  initializeChart(): void {
    this.chart()?.destroy();

    const context = this.canvas.nativeElement.getContext('2d');
    if (!context) {
      console.error('Failed to get canvas context');
      return;
    }

    const newChart = new Chart(context, {
      type: 'line',
      data: this.data(),
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: this.yAxisTitle(),
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                return context.dataset.label
                  ? `${context.dataset.label}: ${context.parsed.y || context.raw} kg`
                  : `${context.label}: ${context.raw} kg`;
              },
            },
          },
        },
      },
    });

    // Set the new chart instance as a signal
    this.chart.set(newChart);
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

  /**
   * Updates the chart with new data when inputs change.
   */
  private updateChart(): void {
    if (this.chart()) {
      this.chart()!.data.labels = this.data().labels;
      this.chart()!.data.datasets = this.data().datasets;
      this.chart()!.update();
    }
  }
}
