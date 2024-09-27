import { AfterViewInit, Component, effect, Injector, OnInit, signal, WritableSignal } from '@angular/core';
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
        this.updateCircle();
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }

  ngAfterViewChecked(): void {
    this.updateCircle();
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
    const initialTime = this.pauseTimeService.getInitialTime();
    const remainingTime = this.pauseTimeService.remainingTime();
    const percentageRemaining = ((remainingTime / initialTime) * 100) as Percentage;

    this.percentFinished.set(percentageRemaining);
  }
}
