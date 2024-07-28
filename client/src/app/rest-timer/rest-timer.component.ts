import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  EventEmitter,
  Output,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { PauseTimeService } from '../../service/training/pause-time.service';
import { ModalService } from '../../service/modal/modalService';

@Component({
  selector: 'app-rest-timer',
  templateUrl: './rest-timer.component.html',
  styleUrls: ['./rest-timer.component.scss'],
})
export class RestTimerComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() timerFinished = new EventEmitter<void>();
  @ViewChild('progressRing') progressRing!: ElementRef;

  remainingTime: number;
  timerSubscription: Subscription | null = null;
  initialTime: number;

  constructor(
    private pauseTimeService: PauseTimeService,
    private modalService: ModalService
  ) {
    this.remainingTime = this.pauseTimeService.getCurrentTime();
    this.initialTime = this.pauseTimeService.getInitialTime(); // Store the initial time
  }

  ngOnInit(): void {
    this.timerSubscription = this.pauseTimeService.countdownEmitter.subscribe(
      (remainingTime: number) => {
        this.remainingTime = remainingTime;
        if (this.progressRing) {
          this.updateCircle();
        }
        if (remainingTime === 0) {
          this.timerFinished.emit();
        }
      }
    );
    this.pauseTimeService.countdownEmitter.emit(this.remainingTime);
  }

  ngAfterViewInit(): void {
    this.updateCircle();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  adjustTime(seconds: number) {
    this.pauseTimeService.adjustTime(seconds); // Adjust the timer in the service
  }

  skipTimer() {
    this.pauseTimeService.skipTimer(); // Skip the timer in the service
    this.timerFinished.emit();

    this.modalService.close();
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  private updateCircle() {
    const circle = this.progressRing.nativeElement.querySelector(
      '.progress-ring__circle'
    );
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const offset = (this.remainingTime / this.initialTime) * circumference;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = `${offset}`;
  }
}
