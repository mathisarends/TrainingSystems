import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { PauseTimeService } from '../../../../service/training/pause-time.service';
import { ModalService } from '../../../core/services/modal/modalService';

@Component({
  selector: 'app-rest-timer',
  templateUrl: './rest-timer.component.html',
  styleUrls: ['./rest-timer.component.scss'],
})
export class RestTimerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('progressRing') progressRing!: ElementRef;

  remainingTime: number;
  timerSubscription: Subscription | null = null;
  initialTime: number;

  constructor(
    private pauseTimeService: PauseTimeService,
    private modalService: ModalService,
  ) {
    this.remainingTime = this.pauseTimeService.getCurrentTime();
    this.initialTime = this.pauseTimeService.getInitialTime(); // Store the initial time
  }

  ngOnInit(): void {
    this.timerSubscription = this.pauseTimeService.countdownEmitter.subscribe((remainingTime: number) => {
      this.remainingTime = remainingTime;
      if (this.progressRing) {
        this.updateCircle();
      }
      if (remainingTime === 0 && this.initialTime) {
        this.playTimerFinishedAudio();
      }
    });

    this.pauseTimeService.countdownEmitter.emit(this.remainingTime);
  }

  // Intitial color
  ngAfterViewChecked(): void {
    if (this.progressRing && this.remainingTime === 0) {
      // Initiale Kreisfüllung beim Start
      this.updateCircle();
    }
  }

  playTimerFinishedAudio() {
    new Audio('./audio/boxing_bell.mp3').play();
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
    this.sendMessageToServiceWorker('adjustTime', { seconds });
  }

  skipTimer() {
    this.sendMessageToServiceWorker('stop');
    this.playTimerFinishedAudio();

    this.modalService.close();
  }

  private sendMessageToServiceWorker(command: string, data?: any) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        command,
        ...data,
      });
    } else {
      console.error('[RestTimerComponent] Service Worker not available or not registered.');
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  private updateCircle() {
    const circle = this.progressRing.nativeElement.querySelector('.progress-ring__circle');
    const radius = circle.r.baseVal.value;

    const circumference = 2 * Math.PI * radius;

    let offset = (this.remainingTime / this.initialTime) * circumference;

    if (this.remainingTime === 0) {
      offset = circumference;
    }

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = `${offset}`;
  }
}
