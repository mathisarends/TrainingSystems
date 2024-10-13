import { AsyncPipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, effect, Injector, OnInit, signal, WritableSignal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { IconName } from '../../../shared/icon/icon-name';
import { IconComponent } from '../../../shared/icon/icon.component';
import { NotificationService } from '../../../shared/service/notification.service';
import { HeaderService } from '../../header/header.service';
import { TrainingDayFinishedNotification } from '../../usage-statistics/training-finished-notification';
import { TrainingLogCardSkeletonComponent } from '../../usage-statistics/training-log-card-skeleton/training-log-card-skeleton.component';
import { TrainingLogCardComponent } from '../../usage-statistics/training-log-card/training-log-card.component';

@Component({
  standalone: true,
  imports: [
    TrainingLogCardComponent,
    AlertComponent,
    SpinnerComponent,
    AsyncPipe,
    SearchBarComponent,
    TrainingLogCardSkeletonComponent,
    IconComponent,
    ButtonComponent,
  ],
  selector: 'app-training-logs',
  templateUrl: 'training-logs.component.html',
  styleUrls: ['./training-logs.component.scss'],
})
export class TrainingLogsComponent implements OnInit, AfterViewInit {
  protected readonly IconName = IconName;

  trainingDayNotifications$!: Observable<TrainingDayFinishedNotification[]>;

  cachedTrainingNotifications: WritableSignal<TrainingDayFinishedNotification[]> = signal([]);
  filteredTrainingNotifications: WritableSignal<TrainingDayFinishedNotification[]> = signal([]);

  searchQuery = signal('');

  constructor(
    protected notificationService: NotificationService,
    private headerService: HeaderService,
    private httpService: HttpService,
    private injector: Injector,
  ) {}

  ngOnInit(): void {
    this.headerService.setHeadlineInfo({
      title: 'Logs',
    });

    this.loadLogEntries(16);

    effect(
      () => {
        this.filterTrainingNotifications();
      },
      { injector: this.injector, allowSignalWrites: true },
    );
  }

  ngAfterViewInit(): void {
    this.httpService.delete('/user/activity/unseen-training-notifications').subscribe(() => {});
  }

  protected loadLogEntries(limit?: number) {
    const httpParams = new HttpParams();
    if (limit) {
      httpParams.set('limit', limit.toString());
    }

    this.trainingDayNotifications$ = this.httpService
      .get<TrainingDayFinishedNotification[]>('/user/activity/training-notifications', httpParams)
      .pipe(
        tap((notifications) => {
          this.cachedTrainingNotifications.set(notifications);
          this.filteredTrainingNotifications.set(notifications);
        }),
      );
  }

  private filterTrainingNotifications(): void {
    const query = this.searchQuery().toLowerCase();

    const filtered = this.cachedTrainingNotifications().filter((notification) => {
      return notification.planTitle.toLowerCase().includes(query);
    });

    this.filteredTrainingNotifications.set(filtered);
  }
}
