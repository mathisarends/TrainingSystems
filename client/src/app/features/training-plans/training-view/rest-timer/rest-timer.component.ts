import { Component, effect, Injector, OnInit, signal, WritableSignal } from '@angular/core';
import { ModalService } from '../../../../core/services/modal/modalService';
import { PercentageCircleVisualisationComponent } from '../../../../shared/components/percentage-circle-visualisation/percentage-circle-visualisation.component';
import { Percentage } from '../../../../shared/components/percentage-circle-visualisation/percentage.type';
import { IconName } from '../../../../shared/icon/icon-name';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { FormatTimePipe } from '../../format-time.pipe';
import { PauseTimeService } from '../services/pause-time.service';

@Component({
  selector: 'app-rest-timer',
  standalone: true,
  imports: [PercentageCircleVisualisationComponent, FormatTimePipe, IconComponent],
  templateUrl: './rest-timer.component.html',
  styleUrls: ['./rest-timer.component.scss'],
})
export class RestTimerComponent implements OnInit {
  protected readonly IconName = IconName;
  percentageRemaining: WritableSignal<Percentage> = signal(100);

  constructor(
    protected pauseTimeService: PauseTimeService,
    private modalService: ModalService,
    private injector: Injector,
  ) {}

  ngOnInit(): void {
    effect(
      () => {
        this.calculateRemainingRestTimePercentage();
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }

  adjustTime(seconds: number) {
    if (this.pauseTimeService.remainingTime() + seconds < 0) {
      seconds = 0;
    }

    this.pauseTimeService.adjustTime(seconds);
  }

  skipTimer() {
    this.pauseTimeService.skipTimer();
    this.modalService.close();
  }

  private calculateRemainingRestTimePercentage() {
    const initialTime = this.pauseTimeService.getInitialTime();
    const remainingTime = this.pauseTimeService.remainingTime();

    if (remainingTime === 0) {
      this.percentageRemaining.set(100);
      return;
    }

    const percentageRemaining = ((remainingTime / initialTime) * 100) as Percentage;
    this.percentageRemaining.set(percentageRemaining);
  }
}
