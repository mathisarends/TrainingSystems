import { Component } from '@angular/core';
import Chart from 'chart.js/auto';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { CircularIconButtonComponent } from '../../circular-icon-button/circular-icon-button.component';
import { ChartComponent } from '../chart.component';

/**
 * PolarChartComponent
 * This component renders a polar area chart using Chart.js.
 * It also supports dynamically updating the chart when input data changes
 * and allows downloading the chart as a PNG.
 */
@Component({
  selector: 'app-polar-chart',
  standalone: true,
  imports: [CircularIconButtonComponent, TooltipDirective],
  templateUrl: './polar-chart.component.html',
  styleUrls: ['./polar-chart.component.scss'],
})
export class PolarChartComponent extends ChartComponent<'polarArea'> {
  initializeChart(): void {
    this.chart()?.destroy(); // prevent memory leaks

    const context = this.canvas.nativeElement.getContext('2d');
    if (!context) {
      console.error('Failed to get canvas context');
      return;
    }

    const newChart = new Chart<'polarArea'>(context, {
      type: 'polarArea',
      data: {
        labels: this.data().labels,
        datasets: this.data().datasets, // Use the datasets without hardcoded backgroundColor
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });

    this.chart.set(newChart);
  }
}
