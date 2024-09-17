import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

import Chart from 'chart.js/auto';

@Component({
  selector: 'app-polar-chart',
  standalone: true,
  imports: [AlertComponent],
  templateUrl: './polar-chart.component.html',
  styleUrls: ['./polar-chart.component.scss'],
})
export class PolarChartComponent implements AfterViewInit {
  @ViewChild('canvas') canvas!: ElementRef;

  @Input() chartId: string = 'polarAreaChart';
  @Input() data: number[] = [11, 16, 7, 3, 14];
  @Input() labels: string[] = ['Red', 'Green', 'Yellow', 'Grey', 'Blue'];
  @Input() backgroundColors: string[] = ['#FF6384', '#36A2EB', '#FFCE56', '#CCCCCC', '#4BC0C0'];

  chart!: Chart<'polarArea'>;

  ngAfterViewInit(): void {
    this.initializeChart();
  }

  initializeChart(): void {
    const context = this.canvas.nativeElement.getContext('2d');
    if (!context) {
      console.error('Failed to get canvas context');
      return;
    }

    this.chart = new Chart(context, {
      type: 'polarArea',
      data: {
        labels: this.labels,
        datasets: [
          {
            data: this.data,
            backgroundColor: this.backgroundColors,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }
}
