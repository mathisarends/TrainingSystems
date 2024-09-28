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
import { LineChartDataset } from './lilne-chart-data-set';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent implements AfterViewInit {
  @ViewChild('canvas') canvas!: ElementRef;

  chartId = input<string>('lineChart');
  data = input<LineChartDataset[]>([]);
  labels = input<string[]>([]);
  yAxisTitle = input<string>('Value');
  maintainAspectRatio = input<boolean>(true);

  chart = signal<Chart<'line'> | null>(null);

  chartData = computed(() => ({
    labels: this.labels(),
    datasets: this.data(),
  }));

  constructor(private injector: Injector) {}

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

  initializeChart(): void {
    this.chart()?.destroy(); // prevent memoryr leaks

    const context = this.canvas.nativeElement.getContext('2d');
    if (!context) {
      console.error('Failed to get canvas context');
      return;
    }

    const newChart = new Chart(context, {
      type: 'line',
      data: this.chartData(),
      options: {
        responsive: true,
        maintainAspectRatio: this.maintainAspectRatio(),
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

  updateChart(): void {
    if (this.chart()) {
      this.chart()!.data.labels = this.labels();
      this.chart()!.data.datasets = this.data();
      this.chart()!.update();
    }
  }
}
