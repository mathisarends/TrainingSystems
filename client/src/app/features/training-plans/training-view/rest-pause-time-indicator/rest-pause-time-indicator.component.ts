import { CommonModule } from '@angular/common';
import { Component, HostBinding, HostListener, signal } from '@angular/core';
import { ModalService } from '../../../../core/services/modal/modalService';
import { toggleCollapseAnimation } from '../../../../shared/animations/toggle-collapse';
import { IconBackgroundColor } from '../../../../shared/components/icon-list-item/icon-background-color';
import { IconName } from '../../../../shared/icon/icon-name';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { FormatTimePipe } from '../../format-time.pipe';
import { RestTimerComponent } from '../rest-timer/rest-timer.component';
import { PauseTimeService } from '../services/pause-time.service';
import { ToPauseTimeProgressPercentagePipe } from './to-pause-time-progress-percentage';

/**
 * A component that displays a rest or pause time indicator.
 */
@Component({
  selector: 'app-rest-pause-time-indicator',
  standalone: true,
  imports: [IconComponent, FormatTimePipe, CommonModule, ToPauseTimeProgressPercentagePipe],
  templateUrl: './rest-pause-time-indicator.component.html',
  styleUrls: ['./rest-pause-time-indicator.component.scss'],
  animations: [toggleCollapseAnimation],
})
export class RestPauseTimeIndicatorComponent {
  protected readonly IconName = IconName;
  protected readonly IconBackgroundColor = IconBackgroundColor;

  isCollapsed = signal(false);

  constructor(
    protected pauseTimeService: PauseTimeService,
    private modalService: ModalService,
  ) {}

  @HostBinding('@toggleCollapse') get toggleAnimation() {
    return this.isCollapsed() ? 'collapsed' : 'expanded';
  }

  @HostListener('click')
  async onHostClick(): Promise<void> {
    this.isCollapsed.set(true);
    await this.modalService.open({
      component: RestTimerComponent,
      title: 'Pause Timer',
      buttonText: 'Abbrechen',
      hasFooter: false,
    });
    this.isCollapsed.set(false);
  }
}
