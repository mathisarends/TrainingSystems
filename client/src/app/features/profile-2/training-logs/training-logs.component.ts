import { AsyncPipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  Injector,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DatePickerComponent } from '../../../shared/components/datepicker/date-picker.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { IconName } from '../../../shared/icon/icon-name';
import { IconComponent } from '../../../shared/icon/icon.component';
import { NotificationService } from '../../../shared/service/notification.service';
import { HeaderService } from '../../header/header.service';
import { TrainingDayFinishedNotification } from '../../usage-statistics/training-finished-notification';
import { TrainingLogCardSkeletonComponent } from '../../usage-statistics/training-log-card-skeleton/training-log-card-skeleton.component';
import { TrainingLogCardComponent } from '../../usage-statistics/training-log-card/training-log-card.component';

/**
 * Displays the training log entries, allows filtering by date and search query.
 * Supports marking notifications as seen and clearing unseen training notifications.
 */
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
    DatePickerComponent,
  ],
  selector: 'app-training-logs',
  templateUrl: 'training-logs.component.html',
  styleUrls: ['./training-logs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingLogsComponent implements OnInit, AfterViewInit {
  protected readonly IconName = IconName;

  /**
   * Observable of training day notifications loaded from the server.
   */
  trainingDayNotifications$!: Observable<TrainingDayFinishedNotification[]>;

  /**
   * Stores cached notifications to avoid refetching them from the server.
   */
  cachedTrainingNotifications: WritableSignal<TrainingDayFinishedNotification[]> = signal([]);
  /**
   * Stores filtered notifications based on user search input.
   */
  filteredTrainingNotifications: WritableSignal<TrainingDayFinishedNotification[]> = signal([]);

  /**
   * Signal holding the user's search query for filtering notifications.
   */
  searchQuery = signal('');

  constructor(
    protected notificationService: NotificationService,
    private headerService: HeaderService,
    private httpService: HttpService,
    private injector: Injector,
  ) {}

  /**
   * Initializes the component, sets the headline information, loads log entries,
   * and sets up the effect to filter notifications based on search query and date.
   */
  ngOnInit(): void {
    this.setHeadlineInfo();

    this.loadLogEntries();

    effect(
      () => {
        this.filterTrainingNotifications();
      },
      { injector: this.injector, allowSignalWrites: true },
    );
  }

  /**
   * Marks unseen training notifications as seen after the view has been initialized.
   */
  ngAfterViewInit(): void {
    this.httpService.delete('/user/activity/unseen-training-notifications').subscribe(() => {});
  }

  /**
   * Loads training log entries from the server and caches them for filtering.
   * @param limit Optional limit to the number of notifications fetched.
   */
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

  /**
   * Filters cached training notifications based on the user's search query.
   */
  private filterTrainingNotifications(): void {
    const query = this.searchQuery().toLowerCase();

    const filtered = this.cachedTrainingNotifications().filter((notification) => {
      return notification.planTitle.toLowerCase().includes(query);
    });

    this.filteredTrainingNotifications.set(filtered);
  }

  private setHeadlineInfo(): void {
    this.headerService.setHeadlineInfo({
      title: 'Logs',
    });
  }
}
