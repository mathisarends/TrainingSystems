import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
})
export class LineChartComponent implements AfterViewInit, OnChanges {
  @ViewChild('canvas') canvas!: ElementRef;

  @Input() chartId: string = 'lineChart';
  @Input() data: any[] = [];
  @Input() labels: string[] = [];
  @Input() yAxisTitle: string = 'Value';
  @Input() maintainAspectRatio: boolean = false;

  chart!: Chart<'line'>;

  ngAfterViewInit(): void {
    this.initializeChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.updateChart();
    }
  }

  initializeChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const context = this.canvas.nativeElement.getContext('2d');
    if (!context) {
      console.error('Failed to get canvas context');
      return;
    }

    this.chart = new Chart(context, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: this.data,
      },
      options: {
        responsive: true,
        maintainAspectRatio: this.maintainAspectRatio,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: this.yAxisTitle,
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                return context.dataset.label
                  ? `${context.dataset.label}: ${
                      context.parsed.y || context.raw
                    } kg`
                  : `${context.label}: ${context.raw} kg`;
              },
            },
          },
        },
      },
    });
  }

  updateChart(): void {
    if (this.chart) {
      this.chart.data.labels = this.labels;
      this.chart.data.datasets = this.data;
      this.chart.update();
    }
  }
}
