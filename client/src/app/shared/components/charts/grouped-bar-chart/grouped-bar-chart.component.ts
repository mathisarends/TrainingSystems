import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  Injector,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import Chart from 'chart.js/auto';
import { BarChartData } from './bar-chart-data';

@Component({
  standalone: true,
  selector: 'app-grouped-bar-chart',
  templateUrl: './grouped-bar-chart.component.html',
  styleUrls: ['./grouped-bar-chart.component.scss'],
})
export class GroupedBarChartComponent implements AfterViewInit {
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef;

  /**
   * Holds the data for the grouped bar chart, including labels and datasets.
   */
  groupedBarChartData = input<BarChartData>({ labels: [], datasets: [] });

  /**
   * Label for the Y-axis of the chart.
   */
  yAxisLabel = input<string>('Value');

  /**
   * Signal to hold the Chart.js instance of the bar chart.
   */
  chart = signal<Chart<'bar'> | null>(null);

  /**
   * Computed value that returns the current grouped bar chart data.
   */
  chartData = computed(() => this.groupedBarChartData());

  constructor(private injector: Injector) {}

  /**
   * Initializes the chart after the view is fully initialized.
   */
  ngAfterViewInit(): void {
    this.createChart();

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
   * Creates the Chart.js bar chart.
   */
  createChart(): void {
    const context = this.barChartCanvas.nativeElement.getContext('2d');
    if (!context) {
      console.error('Failed to get canvas context');
      return;
    }

    const newChart = new Chart(context, {
      type: 'bar',
      data: this.chartData(),
      options: {
        responsive: true,
        scales: {
          x: { beginAtZero: true },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: this.yAxisLabel(),
            },
          },
        },
      },
    });

    this.chart.set(newChart);
  }

  /**
   * Updates the chart with new data.
   */
  updateChart(): void {
    if (this.chart()) {
      this.chart()!.data.labels = this.chartData().labels;
      this.chart()!.data.datasets = this.chartData().datasets;
      this.chart()!.update();
    }
  }
}
