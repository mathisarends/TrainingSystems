import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http-client.service';
import { ActivityCalendarData } from './activity-calendar-data';
import { RecentTrainingDurationsData } from './recent-training-durations-data';

/**
 * Service to retrieve user activity and training statistics data.
 * This service makes HTTP requests to retrieve data related to user activities
 * such as the activity calendar and recent training durations.
 */
@Injectable()
export class UsageStatisticsService {
  constructor(private httpService: HttpService) {}

  /**
   * Retrieves activity calendar data for the user.
   *
   * @returns An `Observable` emitting `ActivityCalendarData` that contains the user's activity data.
   */
  getActivityCalendarData(): Observable<ActivityCalendarData> {
    return this.httpService.get<ActivityCalendarData>('/user/activity/activity-calendar');
  }

  /**
   * Retrieves recent training durations data for the user.
   * Sends a GET request to fetch the most recent training duration statistics of the user.
   */
  getRecentTrainingDurationsData(): Observable<RecentTrainingDurationsData[]> {
    return this.httpService.get<RecentTrainingDurationsData[]>('/user/activity/recent-training-durations');
  }
}
