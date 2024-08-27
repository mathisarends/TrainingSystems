import { Injectable } from '@angular/core';
import { HttpService } from '../../service/http/http-client.service';
import { Observable } from 'rxjs';
import { TrainingDay } from '../Pages/training-view/training-day';

@Injectable()
export class NotificationPageService {
  constructor(private httpService: HttpService) {}

  getTrainingDayNotifications(): Observable<TrainingDay[]> {
    return this.httpService.get<TrainingDay[]>('/user/training-notifications');
  }
}
