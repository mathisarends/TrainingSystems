import { Component, output } from '@angular/core';
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

  previousMonth = output<void>();
  nextMonth = output<void>();

  goToPreviousMonth() {
    this.previousMonth.emit();
  }

  goToNextMonth() {
    this.nextMonth.emit();
  }
}
