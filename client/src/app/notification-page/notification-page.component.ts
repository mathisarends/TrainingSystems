import { Component, OnInit } from '@angular/core';
import { NotificationPageService } from './notification-page.service';

@Component({
  selector: 'app-notification-page',
  standalone: true,
  providers: [NotificationPageService],
  templateUrl: './notification-page.component.html',
  styleUrl: './notification-page.component.scss',
  imports: [],
})
export class NotificationPageComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
