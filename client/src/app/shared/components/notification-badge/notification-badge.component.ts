import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-notification-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (count() > 0) {
      <span [ngClass]="position()">{{ count() }}</span>
    }
  `,
  styleUrls: ['./notification-badge.component.scss'],
})
export class NotificationBadgeComponent {
  /**
   * Input to pass the notification count.
   */
  count = input<number>(0);

  /**
   * Input to set the badge position: 'top-right' or 'top-left'.
   */
  position = input<'top-right' | 'top-left'>('top-right');
}
