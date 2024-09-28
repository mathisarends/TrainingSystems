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
import { LineChartData } from './line-chart-data';
import { LineChartOptions } from './line-chart-options';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent implements AfterViewInit {
  @ViewChild('canvas') canvas!: ElementRef;

  // Simplified inputs using the new interfaces
  chartId = input<string>('lineChart');
  data = input<LineChartData>({ labels: [], datasets: [] });
  options = input<LineChartOptions>({ yAxisTitle: 'Value', maintainAspectRatio: true, responsive: true });

  chart = signal<Chart<'line'> | null>(null);

  chartData = computed(() => this.data());

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
    this.chart()?.destroy(); // prevent memory leaks

    const context = this.canvas.nativeElement.getContext('2d');
    if (!context) {
      console.error('Failed to get canvas context');
      return;
    }

    const newChart = new Chart(context, {
      type: 'line',
      data: this.chartData(),
      options: {
        responsive: this.options().responsive ?? true,
        maintainAspectRatio: this.options().maintainAspectRatio ?? true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: this.options().yAxisTitle ?? 'Value',
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
      this.chart()!.data.labels = this.data().labels;
      this.chart()!.data.datasets = this.data().datasets;
      this.chart()!.update();
    }
  }
}
