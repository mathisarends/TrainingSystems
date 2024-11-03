import { Component, computed, model } from '@angular/core';
import { IconName } from '../../../../shared/icon/icon-name';
import { IconComponent } from '../../../../shared/icon/icon.component';

@Component({
  selector: 'app-month-navigation',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './month-navigation.component.html',
  styleUrls: ['./month-navigation.component.scss'],
})
export class MonthNavigationComponent {
  protected readonly IconName = IconName;

  protected readonly monthNames: string[] = [
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

  currentMonth = model.required<number>();

  currentMonthName = computed(() => this.monthNames[this.currentMonth()]);

  goToPreviousMonth() {
    let month = this.currentMonth() - 1;
    if (month < 0) month = 11;
    this.currentMonth.set(month);
  }

  goToNextMonth() {
    let month = this.currentMonth() + 1;
    if (month > 11) month = 0;
    this.currentMonth.set(month);
  }
}
