import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, OnInit, signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { BasicInfoModalOptionsBuilder } from '../../../core/services/modal/basic-info/basic-info-modal-options-builder';
import { ModalService } from '../../../core/services/modal/modal.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { SwipeDirective } from '../../../shared/directives/swipe.directive';
import { IconName } from '../../../shared/icon/icon-name';
import { KeyboardService } from '../../../shared/service/keyboard.service';
import { HeaderService } from '../../header/header.service';
import { SetHeadlineInfo } from '../../header/set-headline-info';
import { CalendarEventComponent } from '../calendar-event/calendar-event.component';
import { TrainingDayCalendarDataDto } from './dto/training-day-calendar-data.dto';
import { ExtractTrainingDayFromCalendarDataPipe } from './extract-upcoming-training-day-from-calendar-data.pipe';
import { IsCurrentDayPipe } from './is-current-day.pipe';
import { MonthNavigationComponent } from './month-navigation/month-navigation.component';

@Component({
  selector: 'app-training-log-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MonthNavigationComponent,
    IsCurrentDayPipe,
    CalendarEventComponent,
    SpinnerComponent,
    ExtractTrainingDayFromCalendarDataPipe,
    SwipeDirective,
  ],
  templateUrl: './training-calendar.component.html',
  styleUrls: ['./training-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingLogCalendarComponent implements OnInit, SetHeadlineInfo {
  protected readonly IconName = IconName;

  /**
   * Array of month names for calendar display.
   */
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
   * Signal representing the current day of the month.
   */
  currentDay = signal(new Date().getDate());

  /**
   * Signal representing the current month (0-based index).
   */
  currentMonth = signal(new Date().getMonth());

  /**
   * Computed signal that maps the current month index to its name.
   */
  currentMonthName = computed(() => this.monthNames[this.currentMonth()]);

  /**
   * Signal representing the current year.
   */
  currentYear = signal(new Date().getFullYear());

  /**
   * Signal holding the days within the current month.
   */
  daysInMonth: WritableSignal<number[]> = signal([]);

  /**
   * Signal holding days from the previous month that appear in the current month's calendar view.
   */
  daysFromPreviousMonth: WritableSignal<number[]> = signal([]);

  /**
   * Signal holding days from the next month that appear in the current month's calendar view.
   */
  daysFromNextMonth: WritableSignal<number[]> = signal([]);

  /**
   * Observable providing the training calendar data from the server.
   */
  trainingDayCalendarData$: Observable<TrainingDayCalendarDataDto> | undefined = undefined;

  constructor(
    private httpService: HttpService,
    private modalService: ModalService,
    private headerService: HeaderService,
    private keyboardService: KeyboardService,
  ) {
    this.setupKeyboardListeners();

    effect(
      () => {
        this.generateCalendar();
        this.setHeadlineInfo();
      },
      { allowSignalWrites: true },
    );

    this.trainingDayCalendarData$ = this.httpService.get<TrainingDayCalendarDataDto>('/training-calendar');
  }

  ngOnInit(): void {
    this.navigateToPreviousMonth = this.navigateToPreviousMonth.bind(this);
    this.navigateToNextMonth = this.navigateToNextMonth.bind(this);
  }
  /**
   * Updates the headline information in the header based on the current month and year.
   */
  setHeadlineInfo(): void {
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

  /**
   * Navigates to the previous month, adjusting the year if necessary.
   */
  protected navigateToPreviousMonth(): void {
    const currentMonth = this.currentMonth();
    const currentYear = this.currentYear();

    if (currentMonth === 0) {
      this.currentMonth.set(11);
      this.currentYear.set(currentYear - 1);
    } else {
      this.currentMonth.set(currentMonth - 1);
    }
  }

  /**
   * Navigates to the next month, adjusting the year if necessary.
   */
  protected navigateToNextMonth(): void {
    const currentMonth = this.currentMonth();
    const currentYear = this.currentYear();

    if (currentMonth === 11) {
      this.currentMonth.set(0);
      this.currentYear.set(currentYear + 1);
    } else {
      this.currentMonth.set(currentMonth + 1);
    }
  }

  /**
   * Generates the calendar view for the current month, including days from the previous
   * and next months to fill the calendar grid.
   */
  private generateCalendar() {
    const daysInCurrentMonth = new Date(this.currentYear(), this.currentMonth() + 1, 0).getDate();

    const firstDayOfMonth = new Date(this.currentYear(), this.currentMonth(), 1).getDay();
    const daysInPreviousMonth = new Date(this.currentYear(), this.currentMonth(), 0).getDate();

    const startIndex = (firstDayOfMonth + 6) % 7;
    const daysFromPreviousMonth = Array.from(
      { length: startIndex },
      (_, i) => daysInPreviousMonth - startIndex + i + 1,
    );
    this.daysFromPreviousMonth.set(daysFromPreviousMonth);

    const daysInMonth = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);
    this.daysInMonth.set(daysInMonth);

    const totalDays = this.daysFromPreviousMonth().length + this.daysInMonth().length;
    const remainingDays = 7 - (totalDays % 7);
    const daysFromNextMonth = remainingDays < 7 ? Array.from({ length: remainingDays }, (_, i) => i + 1) : [];
    this.daysFromNextMonth.set(daysFromNextMonth);
  }

  /**
   * Setup the keyboard listeners so that arrow functions can be used to navigate between months.
   */
  private setupKeyboardListeners(): void {
    this.keyboardService.arrowLeftPressed$().subscribe(() => {
      this.navigateToPreviousMonth();
    });

    this.keyboardService.arrowRightPressed$().subscribe(() => {
      this.navigateToNextMonth();
    });
  }

  /**
   * Opens an informational modal about the calendar features.
   */
  private openInfoModal() {
    const modalOptions = new BasicInfoModalOptionsBuilder()
      .setTitle('Hinweise')
      .setInfoText(
        'In diesem Kalender werden alle geplanten Trainings aus deinen Trainingsplänen angezeigt. Zusätzlich kannst du retrospektiv alle vergangenen Trainingseinheiten einsehen. Mit einem Klick auf die einzelnen Tage erhältst du detaillierte Informationen zu deiner Trainingsprogression, inklusive der erreichten Ziele und der wichtigsten Leistungsstatistiken.',
      )
      .build();

    this.modalService.openBasicInfoModal(modalOptions);
  }
}
