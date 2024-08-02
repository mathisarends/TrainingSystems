import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  standalone: true,
  selector: 'app-grouped-bar-chart',
  templateUrl: './grouped-bar-chart.component.html',
  styleUrls: ['./grouped-bar-chart.component.scss'],
})
export class GroupedBarChartComponent implements AfterViewInit {
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef;

  ngAfterViewInit(): void {
    this.createChart();
  }

  createChart(): void {
    const context = this.barChartCanvas.nativeElement.getContext('2d');
    if (!context) {
      console.error('Failed to get canvas context');
      return;
    }

    new Chart(context, {
      type: 'bar',
      data: {
        labels: ['Woche 1', 'Woche 2', 'Woche 3', 'Woche 4'],
        datasets: [
          {
            label: 'Squat',
            data: [10, 12, 15, 13],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
          {
            label: 'Bench Press',
            data: [8, 9, 11, 10],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
          {
            label: 'Deadlift',
            data: [6, 7, 9, 8],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
          {
            label: 'Overhead Press',
            data: [5, 6, 7, 6],
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
          },
        ],
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
              text: 'Sätze',
            },
          },
        },
      },
    });
  }
}
