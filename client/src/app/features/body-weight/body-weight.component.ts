import { ChangeDetectionStrategy, Component, computed, OnInit, signal } from '@angular/core';
import { BodyWeightEntryDto } from './dto/body-weight-entry-dto';
import { BodyWeightService } from './body-weight.service';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { BarChartDataset } from '../../shared/components/charts/grouped-bar-chart/bar-chart.-data-set';
import { GroupedBarChartComponent } from '../../shared/components/charts/grouped-bar-chart/grouped-bar-chart.component';
import { AddRowButtonComponent } from '../training-view-2/add-row-button/add-row-button.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../shared/components/toast/toast.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { firstValueFrom, skip } from 'rxjs';
import { SetHeadlineInfo } from '../header/set-headline-info';
import { HeaderService } from '../header/header.service';
import { IconName } from '../../shared/icon/icon-name';
import { ModalService } from '../../core/services/modal/modal.service';
import { ModalOptionsBuilder } from '../../core/services/modal/modal-options-builder';
import { BodyWeightConfigurationComponent } from './body-weight-configuration/body-weight-configuration.component';
import { BodyWeightConfigurationService } from './body-weight-configuration/body-weight-configuration.service';

@Component({
  selector: 'app-body-weight',
  imports: [
    CommonModule,
    SpinnerComponent,
    GroupedBarChartComponent,
    AddRowButtonComponent,
    ReactiveFormsModule,
    FormsModule,
  ],
  standalone: true,
  templateUrl: './body-weight.component.html',
  styleUrls: ['./body-weight.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BodyWeightComponent implements OnInit, SetHeadlineInfo {
  bodyWeights = signal<BodyWeightEntryDto[]>([]);

  bodyWeightBarChartData = computed(() => this.getWeightGroupedBarChart());

  isLoading = signal<boolean>(true);

  constructor(
    private readonly bodyWeightService: BodyWeightService,
    private readonly toastService: ToastService,
    private headerService: HeaderService,
    private modalService: ModalService,
    private bodyWeightConfigurationService: BodyWeightConfigurationService,
  ) {
    toObservable(this.bodyWeights)
      .pipe(skip(2))
      .subscribe((bodyWeightData) => {
        const mostRecentBodyWeight = bodyWeightData[0];
        this.bodyWeightService.addBodyWeight(mostRecentBodyWeight).subscribe(() => {});
      });
  }

  ngOnInit(): void {
    this.bodyWeightService.getBodyWeights().subscribe({
      next: (data) => {
        this.bodyWeights.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });

    this.setHeadlineInfo();
  }

  setHeadlineInfo() {
    this.headerService.setHeadlineInfo({
      title: 'Training',
      buttons: [{ icon: IconName.DATABASE, callback: () => this.openConfigurationModal() }],
    });
  }

  private openConfigurationModal(): void {
    const modalOptions = new ModalOptionsBuilder()
      .setComponent(BodyWeightConfigurationComponent)
      .setProviderMap(new Map().set(BodyWeightConfigurationService, this.bodyWeightConfigurationService))
      .setTitle('Einstellungen')
      .setOnSubmitCallback(async () => {
        const bodyWeightConfigurationDto = {
          weightGoal: this.bodyWeightConfigurationService.bodyWeightGoal(),
          weightGoalRate: parseFloat(this.bodyWeightConfigurationService.bodyWeightRate().toString()),
        };

        await firstValueFrom(this.bodyWeightService.saveBodyWeightConfiguration(bodyWeightConfigurationDto));
      })
      .build();

    this.modalService.open(modalOptions);
  }

  protected addRow(): void {
    const newDate = new Date().toISOString().split('T')[0];

    if (this.isDateExisting(newDate)) {
      this.toastService.success('Datum bereits belegt!');
      return;
    }

    const newRow: BodyWeightEntryDto = {
      date: new Date().toISOString(),
      weight: 0,
    };

    this.bodyWeights.update((current) =>
      [...current, newRow].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    );
  }

  protected onBodyWeightDataChange(bodyWeight: BodyWeightEntryDto, event: Event): void {
    const newBodyWeight = parseFloat((event.target as HTMLInputElement).value);

    const bodyWeightDate = new Date(bodyWeight.date).toISOString().split('T')[0];

    this.bodyWeights.update((current) =>
      current.map((entry) => {
        const entryDate = new Date(entry.date).toISOString().split('T')[0];
        return entryDate === bodyWeightDate ? { ...entry, weight: newBodyWeight } : entry;
      }),
    );
  }

  /**
   * Maps body weight data to the format required by the bar chart.
   */
  private getWeightGroupedBarChart() {
    const labels = this.bodyWeights().map((entry) => new Date(entry.date).toLocaleDateString('de-DE'));
    const data = this.bodyWeights().map((entry) => entry.weight);

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

  private isDateExisting(date: string): boolean {
    const existingDates = this.bodyWeights().map((bodyWeight) => new Date(bodyWeight.date).toISOString().split('T')[0]);
    return existingDates.includes(date);
  }
}
