import { Component, computed, HostListener, model, signal } from '@angular/core';
import { UserBestPerformanceDto } from '../../../shared/service/user-best-performance/user-best-performance.dto';
import { IconBackgroundColor } from '../../../shared/components/icon-list-item/icon-background-color';
import { ChartData } from '../../../shared/components/charts/chart-data';
import { BarChartDataset } from '../../../shared/components/charts/grouped-bar-chart/bar-chart.-data-set';
import { DashboardCardComponent } from '../../../shared/components/dashboard-card/dashboard-card.component';
import { GroupedBarChartComponent } from '../../../shared/components/charts/grouped-bar-chart/grouped-bar-chart.component';
import { IconName } from '../../../shared/icon/icon-name';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { toggleCollapseAnimation } from '../../../shared/animations/toggle-collapse';
import { ModalService } from '../../../core/services/modal/modal.service';
import { DeleteModalOptionsBuilder } from '../../../core/services/modal/deletion/delete-modal-options.builder';
import { UserBestPerformanceService } from '../../../shared/service/user-best-performance/user-best-performance.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  imports: [DashboardCardComponent, GroupedBarChartComponent, ButtonComponent],
  selector: 'app-best-performance-category-section',
  templateUrl: './best-performance-category-section.component.html',
  styleUrls: ['./best-performance-category-section.component.scss'],
  animations: [toggleCollapseAnimation],
})
export class BestPerformanceCategorySectionComponent {
  protected readonly IconName = IconName;
  categoryPerformanceData = model.required<UserBestPerformanceDto>();

  categoryPerformanceCardInfo = computed(() =>
    this.getDashboardCardComponentDataPerCategory(this.categoryPerformanceData()),
  );

  categoryChartData = computed(() => this.getBestPerformanceProgression(this.categoryPerformanceData()));

  hovered = signal(false);
  private hoverTimeout: any;

  @HostListener('mouseenter')
  onMouseEnter() {
    this.hoverTimeout = setTimeout(() => {
      this.hovered.set(true);
    }, 150);
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    clearTimeout(this.hoverTimeout); // Clear the timeout to prevent setting `hovered` to true
    this.hovered.set(false);
  }

  constructor(
    private readonly modalService: ModalService,
    private readonly userBestPerformanceService: UserBestPerformanceService,
  ) {}

  protected showDeleteMostRecentEntryModal(): void {
    const deletionKeyWord = this.categoryPerformanceData().exerciseName;

    const deleteModalOptions = new DeleteModalOptionsBuilder()
      .setTitle('Bestleistung löschen')
      .setDeletionKeyword(deletionKeyWord)
      .setOnSubmitCallback(async () => {
        await firstValueFrom(
          this.userBestPerformanceService.deleteMostRecentBestPerformanceEntryForExerciseName(
            this.categoryPerformanceData().exerciseName,
          ),
        );

        const updatedData = {
          ...this.categoryPerformanceData(),
          previousRecords: [...this.categoryPerformanceData().previousRecords.slice(0, -1)],
        };

        this.categoryPerformanceData.set(updatedData);
      })
      .build();

    this.modalService.openDeletionModal(deleteModalOptions);
  }

  private getDashboardCardComponentDataPerCategory(userBestPerformanceDto: UserBestPerformanceDto) {
    return {
      title: userBestPerformanceDto.category + ' | ' + userBestPerformanceDto.exerciseName,
      iconBackgroundColor: IconBackgroundColor.BlueViolet,
      unit: userBestPerformanceDto.estMax,
      prIncrement: this.getMostRecentPrIncrement(userBestPerformanceDto),
    };
  }

  private getBestPerformanceProgression(userBestPerformanceDto: UserBestPerformanceDto): ChartData<BarChartDataset> {
    const labels = userBestPerformanceDto.previousRecords.map((previousRecord) =>
      this.convertDateToStringRepresentation(previousRecord.achievedAt),
    );

    labels.push(this.convertDateToStringRepresentation(userBestPerformanceDto.achievedAt));

    const bestPerformanceData = userBestPerformanceDto.previousRecords.map((previousRecord) => previousRecord.estMax);
    bestPerformanceData.push(userBestPerformanceDto.estMax);

    const datasets: BarChartDataset[] = [
      {
        label: `${userBestPerformanceDto.exerciseName} PR`,
        data: bestPerformanceData,
        backgroundColor: 'rgba(99, 132, 255, 0.6)',
        borderColor: 'rgba(99, 132, 255, 1)',
      },
    ];

    return {
      labels: labels,
      datasets: datasets,
    };
  }

  private convertDateToStringRepresentation(date: string | Date): string {
    const parsedDate = date instanceof Date ? date : new Date(date);
    return parsedDate.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  }

  private getMostRecentPrIncrement(userBestPerformanceDto: UserBestPerformanceDto): number {
    if (userBestPerformanceDto.previousRecords.length <= 1) {
      return userBestPerformanceDto.estMax;
    }

    return userBestPerformanceDto.estMax - userBestPerformanceDto.previousRecords[0].estMax;
  }
}
