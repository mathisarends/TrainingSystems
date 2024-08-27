import { Component, OnInit } from '@angular/core';
import { NotificationService } from './notification.service';
import { CommonModule } from '@angular/common';

import { Observable } from 'rxjs';
import { TrainingDay } from '../Pages/training-view/training-day';
import { SpinnerComponent } from '../components/loaders/spinner/spinner.component';

@Component({
  selector: 'app-notification-page',
  standalone: true,
  providers: [NotificationService],
  templateUrl: './notification-page.component.html',
  styleUrl: './notification-page.component.scss',
  imports: [CommonModule, SpinnerComponent],
})
export class NotificationPageComponent implements OnInit {
  constructor(private notificationService: NotificationService) {}

  /**
   * Observable that emits the exercise data or null if there's an error or it's still loading.
   */
  trainingDayNotifications$!: Observable<TrainingDay[]>;

  ngOnInit(): void {
    this.trainingDayNotifications$ = this.notificationService.getTrainingDayNotifications();
  }
}
