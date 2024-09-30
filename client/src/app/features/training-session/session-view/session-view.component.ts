import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { IconName } from '../../../shared/icon/icon-name';
import { HeaderService } from '../../header/header.service';
import { TrainingSessionDto } from '../model/training-session-dto';
import { TrainingSessionService } from '../training-session-service';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-session-view',
  templateUrl: './session-view.component.html',
  styleUrls: ['./session-view.component.scss'],
  providers: [TrainingSessionService],
})
export class SessionViewComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private destroyRef: DestroyRef,
    private headerService: HeaderService,
    private trainingSessionService: TrainingSessionService,
  ) {}

  sessionId = signal('');

  version = signal<number>(0);

  ngOnInit() {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.headerService.setLoading();
      this.sessionId.set(params['sessionId']);

      const versionParam = Number(params['version']);
      this.version.set(versionParam);

      this.loadSessionData();
    });
  }

  loadSessionData(): void {
    this.trainingSessionService.getTrainingSessionById(this.sessionId()).subscribe((sessionData) => {
      console.log(
        '🚀 ~ SessionViewComponent ~ this.trainingSessionService.getTrainingSessionById ~ response:',
        sessionData,
      );

      this.setHeadlineInfo(sessionData);
    });
  }

  private setHeadlineInfo(trainingSesssion: TrainingSessionDto) {
    this.headerService.setHeadlineInfo({
      title: trainingSesssion.title,
      subTitle: `V${this.version() + 1}`,
      buttons: [
        {
          icon: IconName.MORE_VERTICAL,
        },
      ],
    });
  }
}
