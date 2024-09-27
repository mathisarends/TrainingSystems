import { AfterViewInit, Component, effect, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalService } from '../../../../core/services/modal/modalService';
import { ServiceWorkerService } from '../../../../platform/service-worker.service';
import { PercentageCircleVisualisationComponent } from '../../../../shared/components/percentage-circle-visualisation/percentage-circle-visualisation.component';
import { FormatTimePipe } from '../../format-time.pipe';
import { PauseTimeService } from '../services/pause-time.service';

@Component({
  selector: 'app-rest-timer',
  standalone: true,
  imports: [PercentageCircleVisualisationComponent, FormatTimePipe],
  templateUrl: './rest-timer.component.html',
  styleUrls: ['./rest-timer.component.scss'],
})
export class RestTimerComponent implements OnInit, AfterViewInit {
  @ViewChild('progressRing') progressRing!: ElementRef;

  remainingTime: number;
  timerSubscription: Subscription | null = null;
  initialTime: number;

  constructor(
    private pauseTimeService: PauseTimeService,
    private modalService: ModalService,
    private serviceWorkerService: ServiceWorkerService,
    private injector: Injector,
  ) {
    this.remainingTime = this.pauseTimeService.getCurrentTime();
    this.initialTime = this.pauseTimeService.getInitialTime();
  }

  ngOnInit(): void {
    effect(
      () => {
        this.remainingTime = this.pauseTimeService.remainingTime();
        if (this.progressRing) {
          this.updateCircle();
        }
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }

  // Initiale Kreisfüllung beim Start
  ngAfterViewChecked(): void {
    if (this.progressRing && this.remainingTime === 0) {
      this.updateCircle();
    }
  }

  ngAfterViewInit(): void {
    this.updateCircle();
  }

  adjustTime(seconds: number) {
    this.sendMessageToServiceWorker('adjustTime', { seconds });
  }

  skipTimer() {
    this.sendMessageToServiceWorker('stop');

    this.modalService.close();
  }

  private sendMessageToServiceWorker(command: string, data?: any) {
    this.serviceWorkerService.sendMessageToServiceWorker({
      command,
      ...data,
    });
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
