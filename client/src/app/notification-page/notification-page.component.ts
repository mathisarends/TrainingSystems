import { Component, OnInit } from '@angular/core';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-notification-page',
  standalone: true,
  providers: [NotificationService],
  templateUrl: './notification-page.component.html',
  styleUrl: './notification-page.component.scss',
  imports: [],
})
export class NotificationPageComponent implements OnInit {
  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.getTrainingDayNotifications().subscribe((response) => {
      console.log('response', response);
    });
  }
}
