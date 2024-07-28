import { Component } from '@angular/core';
import { PauseTimeService } from '../../service/training/pause-time.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pause-time-progress-bar',
  standalone: true,
  imports: [],
  templateUrl: './pause-time-progress-bar.component.html',
  styleUrl: './pause-time-progress-bar.component.scss',
})
export class PauseTimeProgressBarComponent {
  progress: number = 100;
  timeDisplay: string = '00:00';
  private subscription: Subscription = new Subscription();
  private initialTime: number = 0;

  constructor(private pauseTimeService: PauseTimeService) {}

  ngOnInit(): void {
    this.subscription = this.pauseTimeService.countdownEmitter.subscribe(
      (remainingTime: number) => {
        if (this.initialTime === 0) {
          this.initialTime = remainingTime;
        }
        this.updateProgressBar(remainingTime);
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private updateProgressBar(remainingTime: number): void {
    this.progress = (remainingTime / this.initialTime) * 100;
    this.timeDisplay = this.formatTime(remainingTime);
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${this.pad(minutes)}:${this.pad(secs)}`;
  }

  private pad(value: number): string {
    return value.toString().padStart(2, '0');
  }
}
