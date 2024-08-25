import { Component, OnInit } from '@angular/core';
import { ActivityCalendar } from '../activity-calendar/activity-calendar.component';
import { HttpService } from '../../service/http/http-client.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SpinnerComponent } from '../components/loaders/spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { ActivityCalendarData } from './activity-calendar-data';

@Component({
  selector: 'app-usage-statistics',
  standalone: true,
  imports: [ActivityCalendar, SpinnerComponent, CommonModule],
  templateUrl: './usage-statistics.component.html',
  styleUrls: ['./usage-statistics.component.scss'], // Corrected to styleUrls
})
export class UsageStatisticsComponent implements OnInit {
  /**
   * Observable that emits the exercise data as an object with day indices as keys and tonnage values, or null if there's an error or it's still loading.
   */
  activityCalendarData$!: Observable<ActivityCalendarData | null>;

  constructor(private httpClient: HttpService) {}

  ngOnInit(): void {
    // Assign the observable to activityCalendarData$ to be used in the template
    this.activityCalendarData$ = this.httpClient.get<ActivityCalendarData>('/user/activity-calendar').pipe(
      map((response) => {
        console.log('🚀 ~ UsageStatisticsComponent ~ ngOnInit ~ response:', response);
        return response;
      }),
      catchError((error) => {
        console.error('Error fetching activity calendar data:', error);
        return of(null); // Return null in case of error
      }),
    );
  }
}
