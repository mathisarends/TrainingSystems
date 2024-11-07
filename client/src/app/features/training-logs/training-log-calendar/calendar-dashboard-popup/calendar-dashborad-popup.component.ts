import { Component } from '@angular/core';
import { IconName } from '../../../../../shared/icon/icon-name';
import { IconComponent } from '../../../../../shared/icon/icon.component';

@Component({
  standalone: true,
  imports: [IconComponent],
  selector: 'app-calendar-dashboard-popup',
  templateUrl: './calendar-dashboard-popup.component.html',
  styleUrls: ['./calendar-dashboard-popup.component.scss'],
})
export class CalendarDashboardPopupComponent {
  protected readonly IconName = IconName;
}
