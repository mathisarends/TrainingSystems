import { Component, Input, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss',
})
export class ProgressBarComponent implements OnInit {
  @Input() pauseTime!: number;
  @Input() category!: string;
  remainingTime!: number;
  progress: number = 100;
  timerSubscription!: Subscription;

  ngOnInit() {
    this.startTimer(this.pauseTime);
  }

  startTimer(pauseTime: number) {
    this.remainingTime = pauseTime;
    this.progress = 100;
    this.timerSubscription = interval(1000).subscribe(() => {
      this.remainingTime--;
      this.progress = (this.remainingTime / pauseTime) * 100;
      if (this.remainingTime <= 0) {
        this.timerSubscription.unsubscribe();
      }
    });
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
