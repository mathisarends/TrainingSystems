import { Injectable } from '@angular/core';
import { HttpService } from '../../service/http/http-client.service';
import { TrainingDay } from '../Pages/training-view/training-day';
import { Observable } from 'rxjs';

@Injectable()
export class NotificationService {
  constructor(private httpService: HttpService) {}

  getTrainingDayNotifications(): Observable<TrainingDay[]> {
    return this.httpService.get<TrainingDay[]>('/user/training-notifications');
  }
}
