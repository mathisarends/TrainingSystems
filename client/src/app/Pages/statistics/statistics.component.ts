import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { HttpClientService } from '../../../service/http/http-client.service';
import { HttpMethods } from '../../types/httpMethods';
import { SpinnerComponent } from '../../components/spinner/spinner.component';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [SpinnerComponent],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {
  public lineChart: any;
  dataLoaded: boolean = false;

  constructor(private router: Router, private httpService: HttpClientService) {}

  ngOnInit(): void {
    const id = this.router.url.split('/').pop();
    this.fetchTrainingStatistics(id);
  }

  fetchTrainingStatistics(id: string | undefined): void {
    this.httpService
      .request<any>(HttpMethods.GET, `training/statistics/${id}`)
      .subscribe((response) => {
        console.log(
          '🚀 ~ StatisticsComponent ~ .subscribe ~ response:',
          response
        );
        this.dataLoaded = true;
        this.initializeChart(response);
      });
  }

  // Initialize the chart with the fetched data
  initializeChart(data: any): void {
    const squatData = this.extractTonnageData(data.squat);
    const benchData = this.extractTonnageData(data.bench);
    const deadliftData = this.extractTonnageData(data.deadlift);
    const labels = this.generateLabels(squatData.length);

    this.lineChart = new Chart('MyLineChart', {
      type: 'line',
      data: {
        labels: labels, // Use dynamically generated labels
        datasets: [
          {
            label: 'Squat',
            data: squatData,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: false,
          },
          {
            label: 'Bench',
            data: benchData,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: false,
          },
          {
            label: 'Deadlift',
            data: deadliftData,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Tonnage (kg)',
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.dataset.label + ': ' + context.parsed.y + ' kg';
              },
            },
          },
        },
      },
    });
  }

  // Helper function to extract tonnage data
  extractTonnageData(data: any[]): number[] {
    return data.map((week) => week.tonnageInCategory);
  }

  // Helper function to generate dynamic labels based on the length of the data
  generateLabels(length: number): string[] {
    return Array.from({ length }, (_, index) => `Woche ${index + 1}`);
  }
}
