import { ChangeDetectionStrategy, Component } from '@angular/core';
import Chart from 'chart.js/auto';
import { CircularIconButtonComponent } from '../../circular-icon-button/circular-icon-button.component';
import { ChartComponent } from '../chart.component';

@Component({
  selector: 'app-line-chart',
  imports: [CircularIconButtonComponent],
  standalone: true,
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChartComponent extends ChartComponent<'line'> {
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

    const newChart = new Chart<'line'>(context, {
      type: 'line',
      data: this.data(),
      options: {
        responsive: true,
        maintainAspectRatio: false,
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

    this.chart.set(newChart);
  }
}
