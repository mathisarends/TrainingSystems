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
  selector: 'app-pie-chart',
  standalone: true,
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss',
})
export class PieChartComponent implements AfterViewInit, OnChanges {
  @ViewChild('canvas') canvas!: ElementRef;

  @Input() chartId: string = 'pieChart';
  @Input() data: any[] = []; // Array of data for the Pie chart
  @Input() labels: string[] = []; // Array of labels for the Pie chart
  @Input() backgroundColors: string[] = []; // Array of background colors for the Pie chart

  pieChart!: Chart<'pie'>;

  ngAfterViewInit(): void {
    this.initializeChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.updateChart();
    }
  }

  initializeChart(): void {
    if (this.pieChart) {
      this.pieChart.destroy();
    }

    const context = this.canvas.nativeElement.getContext('2d');
    if (!context) {
      console.error('Failed to get canvas context');
      return;
    }

    this.pieChart = new Chart(context, {
      type: 'pie',
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
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                return context.label + ': ' + context.raw + ' kg';
              },
            },
          },
        },
      },
    });
  }

  updateChart(): void {
    if (this.pieChart) {
      this.pieChart.data.labels = this.labels;
      this.pieChart.data.datasets = this.data;
      this.pieChart.update();
    }
  }
}
