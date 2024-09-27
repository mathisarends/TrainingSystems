import { CommonModule } from '@angular/common';
import { Component, effect, HostBinding, HostListener, Injector, OnInit, signal } from '@angular/core';
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
export class RestPauseTimeIndicatorComponent implements OnInit {
  protected readonly IconName = IconName;
  protected readonly IconBackgroundColor = IconBackgroundColor;

  isCollapsed = signal(true);

  constructor(
    protected pauseTimeService: PauseTimeService,
    private modalService: ModalService,
    private injector: Injector,
  ) {}

  ngOnInit(): void {
    effect(
      () => {
        const isModalVisible = this.modalService.isVisible();
        const isTimerStopped = this.pauseTimeService.remainingTime() === 0;

        if (isTimerStopped || isModalVisible) {
          this.isCollapsed.set(true);
        } else if (!isModalVisible) {
          this.isCollapsed.set(false);
        }
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }

  @HostBinding('@toggleCollapse') get toggleAnimation() {
    return this.isCollapsed() ? 'collapsed' : 'expanded';
  }

  @HostListener('click')
  async onHostClick(): Promise<void> {
    await this.modalService.open({
      component: RestTimerComponent,
      title: this.pauseTimeService.currentExercise(),
      buttonText: 'Abbrechen',
      hasFooter: false,
    });
  }
}
