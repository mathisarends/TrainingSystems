import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { ModalService } from '../../../../core/services/modal/modalService';
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
})
export class RestPauseTimeIndicatorComponent {
  protected readonly IconName = IconName;
  protected readonly IconBackgroundColor = IconBackgroundColor;

  constructor(
    protected pauseTimeService: PauseTimeService,
    private modalService: ModalService,
  ) {}

  @HostListener('click')
  onHostClick(): void {
    this.modalService.open({
      component: RestTimerComponent,
      title: this.pauseTimeService.currentExercise(),
      buttonText: 'Abbrechen',
      hasFooter: false,
    });
  }
}
