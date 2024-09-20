import { Component, AfterViewInit, ViewChild, ElementRef, OnChanges, SimpleChanges, Input } from '@angular/core';
import Chart from 'chart.js/auto';
import { BarChartData } from './bar-chart.-data';

//TODO: Grouped Bar chart dynamisieren mit den set daten
@Component({
  standalone: true,
  selector: 'app-grouped-bar-chart',
  templateUrl: './grouped-bar-chart.component.html',
  styleUrls: ['./grouped-bar-chart.component.scss'],
})
export class GroupedBarChartComponent implements AfterViewInit, OnChanges {
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef;

  @Input() labels!: string[];
  @Input() barChartDataSets!: BarChartData[];
  @Input() yAxisLabel: string = '';

  chart!: Chart<'bar'>;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['barChartDataSets'] && !changes['barChartDataSets'].firstChange) {
      this.updateChart();
    }
  }

  updateChart(): void {
    if (this.chart) {
      this.chart.data.labels = this.labels;
      this.chart.data.datasets = this.barChartDataSets;
      this.chart.update();
    }
  }

  createChart(): void {
    const context = this.barChartCanvas.nativeElement.getContext('2d');
    if (!context) {
      console.error('Failed to get canvas context');
      return;
    }

    this.chart = new Chart(context, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: this.barChartDataSets,
      },
      options: {
        responsive: true,
        scales: {
          x: {
            beginAtZero: true,
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: this.yAxisLabel,
            },
          },
        },
      },
    });
  }
}
