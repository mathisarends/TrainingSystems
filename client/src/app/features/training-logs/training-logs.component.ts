import { AsyncPipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpService } from '../../core/services/http-client.service';
import { ModalService } from '../../core/services/modal/modalService';
import { ModalSize } from '../../core/services/modal/modalSize';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { DatePickerComponent } from '../../shared/components/datepicker/date-picker.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { IconName } from '../../shared/icon/icon-name';
import { IconComponent } from '../../shared/icon/icon.component';
import { NotificationService } from '../../shared/service/notification.service';
import { HeaderService } from '../header/header.service';
import { TrainingDayFinishedNotification } from '../usage-statistics/training-finished-notification';
import { TrainingLogCardSkeletonComponent } from '../usage-statistics/training-log-card-skeleton/training-log-card-skeleton.component';
import { TrainingLogCardComponent } from '../usage-statistics/training-log-card/training-log-card.component';
import { TrainingLogCalendarComponent } from './training-log-calendar/training-log-calendar.component';

// TODO: das hier aufräumen eigentlich
/**
 * Displays the training log entries, allows filtering by date and search query.
 * Supports marking notifications as seen and clearing unseen training notifications.
 */
@Component({
  standalone: true,
  imports: [
    TrainingLogCardComponent,
    SpinnerComponent,
    AsyncPipe,
    SearchBarComponent,
    TrainingLogCardSkeletonComponent,
    IconComponent,
    ButtonComponent,
    DatePickerComponent,
    TrainingLogCalendarComponent,
  ],
  selector: 'app-training-logs',
  templateUrl: 'training-logs.component.html',
  styleUrls: ['./training-logs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingLogsComponent implements OnInit, AfterViewInit {
  protected readonly IconName = IconName;

  monthNames: string[] = [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ];

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

  currentMonth = signal(new Date().getMonth());

  currentMonthName = computed(() => this.monthNames[this.currentMonth()]);

  currentYear = signal(new Date().getFullYear());

  /**
   * Signal holding the user's search query for filtering notifications.
   */
  searchQuery = signal('');

  constructor(
    protected notificationService: NotificationService,
    private headerService: HeaderService,
    private modalService: ModalService,
    private httpService: HttpService,
  ) {
    this.headerService.setLoading();

    effect(
      () => {
        this.setHeadlineInfo();
      },
      { allowSignalWrites: true },
    );
  }

  /**
   * Initializes the component, sets the headline information, loads log entries,
   * and sets up the effect to filter notifications based on search query and date.
   */
  ngOnInit(): void {
    this.loadLogEntries();
  }

  /**
   * Marks unseen training notifications as seen after the view has been initialized.
   */
  ngAfterViewInit(): void {
    this.httpService.delete('/training-log/notifications').subscribe(() => {});
  }

  /**
   * Loads training log entries from the server and caches them for filtering.
   * @param limit Optional limit to the number of notifications fetched.
   */
  protected loadLogEntries() {
    this.trainingDayNotifications$ = this.httpService.get<TrainingDayFinishedNotification[]>('/training-log').pipe(
      tap((notifications) => {
        this.cachedTrainingNotifications.set(notifications);
        this.filteredTrainingNotifications.set(notifications);
      }),
    );
  }

  private setHeadlineInfo(): void {
    this.headerService.setHeadlineInfo({
      title: this.currentMonthName(),
      subTitle: this.currentYear().toString(),
      buttons: [
        {
          icon: IconName.MORE_VERTICAL,
          options: [
            {
              icon: IconName.INFO,
              label: 'Hinweise',
              callback: () => this.openInfoModal(),
            },
          ],
        },
      ],
    });
  }

  private openInfoModal() {
    this.modalService.openBasicInfoModal({
      title: 'Hinweise',
      size: ModalSize.LARGE,
      infoText:
        'In diesem Kalender werden alle geplanten Trainings aus deinen Trainingsplänen angezeigt. Zusätzlich kannst du retrospektiv alle vergangenen Trainingseinheiten einsehen. Mit einem Klick auf die einzelnen Tage erhältst du detaillierte Informationen zu deiner Trainingsprogression, inklusive der erreichten Ziele und der wichtigsten Leistungsstatistiken.',
    });
  }
}
