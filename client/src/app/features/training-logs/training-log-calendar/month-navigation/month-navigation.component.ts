import { Component, computed, model } from '@angular/core';
import { CircularIconButtonComponent } from '../../../../shared/components/circular-icon-button/circular-icon-button.component';
import { IconName } from '../../../../shared/icon/icon-name';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { monthNames } from '../month-names';

@Component({
  selector: 'app-month-navigation',
  standalone: true,
  imports: [IconComponent, CircularIconButtonComponent],
  templateUrl: './month-navigation.component.html',
  styleUrls: ['./month-navigation.component.scss'],
})
export class MonthNavigationComponent {
  protected readonly IconName = IconName;

  protected readonly monthNames = monthNames;

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
