import { Component, computed, OnInit, signal } from '@angular/core';
import { BodyWeightEntryDto } from './dto/body-weight-entry-dto';
import { BodyWeightService } from './body-weight.service';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { BarChartDataset } from '../../shared/components/charts/grouped-bar-chart/bar-chart.-data-set';
import { GroupedBarChartComponent } from '../../shared/components/charts/grouped-bar-chart/grouped-bar-chart.component';
import { AddRowButtonComponent } from '../training-view-2/add-row-button/add-row-button.component';
import { InputComponent } from '../../shared/components/input/input.component';

@Component({
  selector: 'app-body-weight',
  imports: [CommonModule, SpinnerComponent, GroupedBarChartComponent, AddRowButtonComponent, InputComponent],
  standalone: true,
  templateUrl: './body-weight.component.html',
  styleUrls: ['./body-weight.component.scss'],
})
export class BodyWeightComponent implements OnInit {
  bodyWeights = signal<BodyWeightEntryDto[]>([]);

  bodyWeightBarChartData = computed(() => this.getWeightGroupedBarChart());

  isLoading = signal<boolean>(true);

  isVisible = signal(true);

  constructor(private readonly bodyWeightService: BodyWeightService) {}

  ngOnInit(): void {
    this.bodyWeightService.getBodyWeights().subscribe({
      next: (data) => {
        this.bodyWeights.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        console.error('Failed to fetch body weights');
      },
    });
  }

  /**
   * Adds a new row to the body weights.
   */
  protected addRow(): void {
    const newRow: BodyWeightEntryDto = {
      date: new Date().toISOString(),
      weight: 0,
    };

    // Update body weights and re-map chart data
    this.bodyWeights.update((current) => [...current, newRow]);
  }

  /**
   * Maps body weight data to the format required by the bar chart.
   */
  private getWeightGroupedBarChart() {
    const sortedBodyWeights = this.bodyWeights().sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const labels = sortedBodyWeights.map((entry) => new Date(entry.date).toLocaleDateString('de-DE'));
    const data = sortedBodyWeights.map((entry) => entry.weight);

    const datasets: BarChartDataset[] = [
      {
        label: 'Körpergewicht',
        data: data,
        backgroundColor: 'rgba(99, 132, 255, 0.6)',
        borderColor: 'rgba(99, 132, 255, 1)',
      },
    ];

    return {
      labels: labels,
      datasets: datasets,
    };
  }
}
