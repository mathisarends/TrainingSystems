import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  Injector,
  OnInit,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { ModalService } from '../../../../core/services/modal/modalService';
import { ServiceWorkerService } from '../../../../platform/service-worker.service';
import { PercentageCircleVisualisationComponent } from '../../../../shared/components/percentage-circle-visualisation/percentage-circle-visualisation.component';
import { Percentage } from '../../../../shared/components/percentage-circle-visualisation/percentage.type';
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

  percentFinished: WritableSignal<Percentage> = signal(99);

  constructor(
    protected pauseTimeService: PauseTimeService,
    private modalService: ModalService,
    private serviceWorkerService: ServiceWorkerService,
    private injector: Injector,
  ) {}

  ngOnInit(): void {
    effect(
      () => {
        if (this.progressRing) {
          this.updateCircle();
        }
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }

  ngAfterViewChecked(): void {
    if (this.progressRing && this.pauseTimeService.remainingTime() === 0) {
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

    const initialTime = this.pauseTimeService.getInitialTime();
    const remainingTime = this.pauseTimeService.remainingTime();
    const percentageRemaining = ((remainingTime / initialTime) * 100) as Percentage;

    this.percentFinished.set(percentageRemaining);

    const circumference = 2 * Math.PI * radius;

    let offset = (this.pauseTimeService.remainingTime() / this.pauseTimeService.getInitialTime()) * circumference;

    if (this.pauseTimeService.remainingTime() === 0) {
      offset = circumference;
    }

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = `${offset}`;
  }
}
