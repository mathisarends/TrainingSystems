import { Component } from '@angular/core';
import { ActivityCalendar } from '../activity-calendar/activity-calendar.component';

@Component({
  selector: 'app-usage-statistics',
  standalone: true,
  imports: [ActivityCalendar],
  templateUrl: './usage-statistics.component.html',
  styleUrl: './usage-statistics.component.scss',
})
export class UsageStatisticsComponent {}
