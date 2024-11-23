import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, signal, WritableSignal } from '@angular/core';
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
export class TrainingLogCalendarComponent implements SetHeadlineInfo {
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

  currentDay = signal(new Date().getDate());

  currentMonth = signal(new Date().getMonth());

  currentMonthName = computed(() => this.monthNames[this.currentMonth()]);

  currentYear = signal(new Date().getFullYear());

  daysInMonth: WritableSignal<number[]> = signal([]);
  daysFromPreviousMonth: WritableSignal<number[]> = signal([]);
  daysFromNextMonth: WritableSignal<number[]> = signal([]);

  trainingDayCalendarData$: Observable<TrainingDayCalendarDataDto> | undefined = undefined;

  constructor(
    private httpService: HttpService,
    private modalService: ModalService,
    private headerService: HeaderService,
    private keyboardService: KeyboardService,
  ) {
    this.keyboardService.arrowLeftPressed$().subscribe(() => {
      this.navigateToPreviousMonth();
    });

    this.keyboardService.arrowRightPressed$().subscribe(() => {
      this.navigateToNextMonth();
    });

    effect(
      () => {
        this.generateCalendar();
        this.setHeadlineInfo();
      },
      { allowSignalWrites: true },
    );

    this.trainingDayCalendarData$ = this.httpService.get<TrainingDayCalendarDataDto>('/training-calendar');
  }

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
