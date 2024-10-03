import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ModalService } from '../../core/services/modal/modalService';
import { LineChartComponent } from '../../shared/components/charts/line-chart/line-chart.component';
import { SelectComponent } from '../../shared/components/select/select.component';
import { IconName } from '../../shared/icon/icon-name';
import { ImageDownloadService } from '../../shared/service/image-download.service';
import { NotificationService } from '../../shared/service/notification.service';
import { HeaderService } from '../header/header.service';
import { StatisticsService } from './statistics.service';
import { TrainingDayNotificationComponent } from './training-day-notification/training-day-notification.component';
import { TrainingStatisticsDataView } from './training-statistics-data-view';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, TrainingDayNotificationComponent, LineChartComponent, SelectComponent],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  providers: [ImageDownloadService, StatisticsService],
})
export class StatisticsComponent implements OnInit {
  selectedTrainingPlans = signal<string[]>([]);

  trainingPlanTitles = signal<string[]>([]);

  trainingStatisticsDataViewOptions = signal(Object.values(TrainingStatisticsDataView));

  selectedDataViewOption = signal([TrainingStatisticsDataView.VOLUME]);

  constructor(
    protected notificationService: NotificationService,
    private headerService: HeaderService,
    private statisticsService: StatisticsService,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.headerService.setHeadlineInfo({
      title: 'Usage',
      buttons: [{ icon: IconName.COMPARE, callback: this.openConfigModal.bind(this) }],
    });

    this.initializeTrainingPlanSelection();
  }

  private initializeTrainingPlanSelection(): void {
    this.statisticsService.getIdTitleMappingsForTrainingPlans().subscribe((titles) => {
      this.trainingPlanTitles.set(titles);
      this.selectedTrainingPlans.set(titles);
    });
  }

  protected openConfigModal(): void {
    console.log('called ');
    this.modalService.openBasicInfoModal({
      title: 'test',
      infoText: 'TEst 123',
    });
  }
}
