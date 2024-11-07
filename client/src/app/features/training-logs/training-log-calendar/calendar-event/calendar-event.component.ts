import { Component, HostListener, input } from '@angular/core';
import { ModalService } from '../../../../core/services/modal/modalService';
import { IconName } from '../../../../shared/icon/icon-name';
import { CalendarDashboardPopupComponent } from '../calendar-dashboard-popup/calendar-dashboard-popup.component';

@Component({
  selector: 'app-calendar-event',
  standalone: true,
  template: `<div class="calendar-event">{{ title() }}</div>`,
  styleUrls: ['./calendar-event.component.scss'],
})
export class CalendarEventComponent {
  protected readonly IconBackgroundColor = IconName;
  title = input.required<string>();

  constructor(private modalService: ModalService) {}

  @HostListener('click')
  onHostClick() {
    this.modalService.open({
      title: this.title(),
      component: CalendarDashboardPopupComponent,
      hasFooter: false,
    });
  }
}
