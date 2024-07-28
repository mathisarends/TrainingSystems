import { Component, EventEmitter, Output } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { PauseTimeService } from '../../service/training/pause-time.service';

@Component({
  selector: 'app-rest-timer',
  standalone: true,
  imports: [],
  templateUrl: './rest-timer.component.html',
  styleUrl: './rest-timer.component.scss',
})
export class RestTimerComponent {
  pauseTimer() {
    throw new Error('Method not implemented.');
  }
  @Output() timerFinished = new EventEmitter<void>();

  remainingTime: number;
  timerSubscription: Subscription | null = null;

  constructor(private pauseTimeService: PauseTimeService) {
    this.remainingTime = this.pauseTimeService.getCurrentTime();
  }

  ngOnInit(): void {
    this.timerSubscription = this.pauseTimeService.countdownEmitter.subscribe(
      (remainingTime: number) => {
        this.remainingTime = remainingTime;
        if (remainingTime === 0) {
          this.timerFinished.emit();
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  adjustTime(seconds: number) {
    this.remainingTime = Math.max(this.remainingTime + seconds, 0);
    this.pauseTimeService.countdownEmitter.emit(this.remainingTime); // Emit the new remaining time
  }

  skipTimer() {
    this.remainingTime = 0;
    this.pauseTimeService.countdownEmitter.emit(this.remainingTime); // Emit the new remaining time
    this.timerFinished.emit();
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}
