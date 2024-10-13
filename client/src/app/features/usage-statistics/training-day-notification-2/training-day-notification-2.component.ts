import { Component, input, signal, WritableSignal } from '@angular/core';
import { ModalService } from '../../../core/services/modal/modalService';
import { MoreOptionListItem } from '../../../shared/components/more-options-button/more-option-list-item';
import { MoreOptionsList } from '../../../shared/components/more-options-list/more-options-list.component';
import { IconName } from '../../../shared/icon/icon-name';
import { IconComponent } from '../../../shared/icon/icon.component';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { TrainingDayFinishedNotification } from '../training-finished-notification';

@Component({
  selector: 'app-training-day-notification-2',
  templateUrl: './training-day-notification-2.component.html',
  styleUrls: ['./training-day-notification-2.component.scss'],
  standalone: true,
  imports: [FormatDatePipe, IconComponent, MoreOptionsList],
})
export class TrainingDayNotification2Component {
  protected readonly IconName = IconName;

  notification = input.required<TrainingDayFinishedNotification>();

  isMoreOptionsCollapsed = signal(true);

  moreOptions: WritableSignal<MoreOptionListItem[]> = signal([
    { label: 'Ansehehn', icon: IconName.EYE, callback: () => {} },
    {
      label: 'Teilen',
      icon: IconName.SHARE,
      callback: () => {},
    },
  ]);

  constructor(private modalService: ModalService) {}

  protected toggleMoreOptionsCollapseState() {
    this.isMoreOptionsCollapsed.set(!this.isMoreOptionsCollapsed());
  }
}
