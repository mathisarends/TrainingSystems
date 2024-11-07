import { Component } from '@angular/core';
import { DashboardCardComponent } from '../../../../shared/components/dashboard-card/dashboard-card.component';
import { IconName } from '../../../../shared/icon/icon-name';

@Component({
  standalone: true,
  imports: [DashboardCardComponent],
  selector: 'app-calendar-dashboard-popup',
  templateUrl: './calendar-dashboard-popup.component.html',
  styleUrls: ['./calendar-dashboard-popup.component.scss'],
})
export class CalendarDashboardPopupComponent {
  protected readonly IconName = IconName;
}
