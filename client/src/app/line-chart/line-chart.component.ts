import { Component, Input, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [],
  templateUrl: './line-chart.component.html',
  styleUrl: "./line-chart.component.scss"
})
export class LineChartComponent implements OnInit {
  @Input() chartId: string = 'lineChart'; // Default ID for the canvas element
  @Input() data: any[] = []; // Array of datasets
  @Input() labels: string[] = []; // Array of labels for the X-axis
  @Input() yAxisTitle: string = 'Value'; // Title for the Y-axis
  @Input() maintainAspectRatio: boolean = false; // Option to maintain aspect ratio

  lineChart: any;

  ngOnInit(): void {
    this.initializeChart();
  }

  initializeChart(): void {
    if (this.lineChart) {
      this.lineChart.destroy();
    }

    this.lineChart = new Chart(this.chartId, {
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
              label: function (context) {
                return context.dataset.label + ': ' + context.parsed.y;
              },
            },
          },
        },
      },
    });
  }
}
