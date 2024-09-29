import { AfterViewInit, Component, effect, ElementRef, Injector, input, signal, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { IconName } from '../../../icon/icon-name';
import { CircularIconButtonComponent } from '../../circular-icon-button/circular-icon-button.component';
import { LineChartData } from '../line-chart/line-chart-data';

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
export class PolarChartComponent implements AfterViewInit {
  protected readonly IconName = IconName;
  @ViewChild('canvas') canvas!: ElementRef;

  chartId = input<string>('polarAreaChart');
  data = input<LineChartData>({ labels: [], datasets: [] });

  chart = signal<Chart<'polarArea'> | null>(null);

  constructor(private injector: Injector) {}

  ngAfterViewInit(): void {
    this.initializeChart();

    // Dynamically update the chart when any input changes
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

  updateChart(): void {
    if (this.chart()) {
      this.chart()!.data.labels = this.data().labels;
      this.chart()!.data.datasets = this.data().datasets;
      this.chart()!.update();
    }
  }

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
