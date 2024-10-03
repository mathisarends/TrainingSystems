import { Component } from '@angular/core';
import Chart from 'chart.js/auto';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { CircularIconButtonComponent } from '../../circular-icon-button/circular-icon-button.component';
import { ChartComponent } from '../chart.component';

@Component({
  standalone: true,
  selector: 'app-grouped-bar-chart',
  imports: [CircularIconButtonComponent, TooltipDirective],
  templateUrl: './grouped-bar-chart.component.html',
  styleUrls: ['./grouped-bar-chart.component.scss'],
})
export class GroupedBarChartComponent extends ChartComponent<'bar'> {
  /**
   * Creates the Chart.js bar chart.
   */
  initializeChart(): void {
    this.chart()?.destroy();

    const context = this.canvas.nativeElement.getContext('2d');
    if (!context) {
      console.error('Failed to get canvas context');
      return;
    }

    const newChart = new Chart<'bar'>(context, {
      type: 'bar',
      data: this.data(),
      options: {
        responsive: true,
        scales: {
          x: { beginAtZero: true },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: this.yAxisTitle(),
            },
          },
        },
      },
    });

    this.chart.set(newChart);
  }
}
