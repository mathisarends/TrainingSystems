import { Component, input } from '@angular/core';

@Component({
  selector: 'app-notification-badge',
  standalone: true,
  template: `
    @if (count() > 0) {
      {{ count() }}
    }
  `,
  styleUrls: ['./notification-badge.component.scss'],
})
export class NotificationBadgeComponent {
  /**
   * Input to pass the notification count.
   */
  count = input<number>(0);
}
