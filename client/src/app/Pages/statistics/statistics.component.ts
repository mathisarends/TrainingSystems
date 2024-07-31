import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { HttpClientService } from '../../../service/http/http-client.service';
import { HttpMethods } from '../../types/httpMethods';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { TrainingExerciseTonnageDto } from './main-exercise-tonnage-dto';
import { Tonnage } from './tonnage';

/**
 * Component responsible for displaying training statistics in a line chart.
 * The chart shows the tonnage (weight lifted) for different exercise categories over multiple weeks.
 */
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
    const exercises = 'squat,bench,deadlift'; // Define the exercises you want to fetch
    this.httpService
      .request<Partial<TrainingExerciseTonnageDto>>(
        HttpMethods.GET,
        `training/statistics/${id}?exercises=${exercises}`
      )
      .subscribe((response) => {
        console.log(
          '🚀 ~ StatisticsComponent ~ .subscribe ~ response:',
          response
        );
        this.dataLoaded = true;
        this.initializeChart(response);
      });
  }

  initializeChart(data: Partial<TrainingExerciseTonnageDto>): void {
    const datasets = Object.keys(data).map((categoryKey) => {
      const categoryData =
        data[categoryKey as keyof TrainingExerciseTonnageDto];
      return this.createDataset(categoryKey, categoryData || []);
    });

    const labels = this.generateWeekLabels(datasets[0]?.data.length || 0);

    this.lineChart = new Chart('MyLineChart', {
      type: 'line',
      data: {
        labels: labels, // Use dynamically generated labels
        datasets: datasets,
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

  // Create a dataset for a specific exercise category
  createDataset(category: string, data: Tonnage[]): any {
    const colors = this.getCategoryColor(category);
    return {
      label: this.formatCategoryLabel(category),
      data: this.extractTonnageData(data),
      borderColor: colors.borderColor,
      backgroundColor: colors.backgroundColor,
      fill: false,
    };
  }

  extractTonnageData(data: Tonnage[]): number[] {
    return data.map((week) => week.tonnageInCategory);
  }

  // Helper function to generate dynamic labels based on the length of the data
  generateWeekLabels(length: number): string[] {
    return Array.from({ length }, (_, index) => `Woche ${index + 1}`);
  }

  formatCategoryLabel(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  /**
   * Retrieves the color settings (border color and background color) for a specific exercise category.
   * @param category - The name of the exercise category.
   * @returns An object containing the borderColor and backgroundColor for the category.
   */
  getCategoryColor(category: string): {
    borderColor: string;
    backgroundColor: string;
  } {
    const colors: {
      [key: string]: { borderColor: string; backgroundColor: string };
    } = {
      squat: {
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
      bench: {
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
      },
      deadlift: {
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
      overheadpress: {
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
      },
      back: {
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
      },
      chest: {
        borderColor: 'rgba(255, 206, 86, 1)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
      },
      shoulder: {
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
      biceps: {
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
      },
      triceps: {
        borderColor: 'rgba(201, 203, 207, 1)',
        backgroundColor: 'rgba(201, 203, 207, 0.2)',
      },
      legs: {
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
      },
      rdm: {
        // Changed from 'default' to '_default' to avoid reserved keyword issues
        borderColor: 'rgba(201, 203, 207, 1)',
        backgroundColor: 'rgba(201, 203, 207, 0.2)',
      },
    };

    return colors[category];
  }
}
