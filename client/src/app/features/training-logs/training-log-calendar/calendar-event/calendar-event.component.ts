import { Component, input } from '@angular/core';
import { IconName } from '../../../../shared/icon/icon-name';

@Component({
  selector: 'app-calendar-event',
  standalone: true,
  template: `<div class="calendar-event">{{ title() }}</div>`,
  styleUrls: ['./calendar-event.component.scss'],
})
export class CalendarEventComponent {
  protected readonly IconBackgroundColor = IconName;
  title = input.required<string>();
}
