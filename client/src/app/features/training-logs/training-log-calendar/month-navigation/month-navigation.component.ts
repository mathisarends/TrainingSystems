import { Component, model } from '@angular/core';
import { CircularIconButtonComponent } from '../../../../shared/components/circular-icon-button/circular-icon-button.component';
import { IconName } from '../../../../shared/icon/icon-name';
import { IconComponent } from '../../../../shared/icon/icon.component';

@Component({
  selector: 'app-month-navigation',
  standalone: true,
  imports: [IconComponent, CircularIconButtonComponent],
  templateUrl: './month-navigation.component.html',
  styleUrls: ['./month-navigation.component.scss'],
})
export class MonthNavigationComponent {
  protected readonly IconName = IconName;

  currentMonth = model.required<number>();

  currentYear = model.required<number>();

  goToPreviousMonth() {
    let month = this.currentMonth() - 1;
    if (month < 0) {
      month = 11;
      this.currentYear.set(this.currentYear() - 1);
    }
    this.currentMonth.set(month);
  }

  goToNextMonth() {
    let month = this.currentMonth() + 1;
    if (month > 11) {
      month = 0;
      this.currentYear.set(this.currentYear() + 1);
    }
    this.currentMonth.set(month);
  }
}
