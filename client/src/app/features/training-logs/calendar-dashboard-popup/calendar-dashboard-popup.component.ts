import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardCardComponent } from '../../../shared/components/dashboard-card/dashboard-card.component';
import { OnConfirm } from '../../../shared/components/modal/on-confirm';
import { IconName } from '../../../shared/icon/icon-name';

@Component({
  standalone: true,
  imports: [DashboardCardComponent],
  selector: 'app-calendar-dashboard-popup',
  templateUrl: './calendar-dashboard-popup.component.html',
  styleUrls: ['./calendar-dashboard-popup.component.scss'],
})
export class CalendarDashboardPopupComponent implements OnConfirm {
  protected readonly IconName = IconName;

  trainingPlanId = signal<string>('');
  weekIndex = signal(0);
  dayIndex = signal(0);

  constructor(private router: Router) {}

  onConfirm(): void {
    this.router.navigate(['/training/view'], {
      queryParams: { planId: this.trainingPlanId(), week: this.weekIndex(), day: this.dayIndex() },
    });
  }
}
