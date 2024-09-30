import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SkeletonTrainingTableComponent } from '../../../shared/components/loader/skeleton-training-table/skeleton-training-table.component';
import { IconName } from '../../../shared/icon/icon-name';
import { HeaderService } from '../../header/header.service';
import { ExerciseDataDTO } from '../../training-plans/training-view/exerciseDataDto';
import { EstMaxService } from '../../training-plans/training-view/services/estmax.service';
import { Exercise } from '../../training-plans/training-view/training-exercise';
import { TrainingSessionDto } from '../model/training-session-dto';
import { TrainingSession } from '../training-session';
import { TrainingSessionService } from '../training-session-service';

@Component({
  standalone: true,
  imports: [SkeletonTrainingTableComponent, InputComponent, DropdownComponent, CommonModule],
  selector: 'app-session-view',
  templateUrl: './session-view.component.html',
  styleUrls: ['./session-view.component.scss'],
  providers: [TrainingSessionService, EstMaxService],
})
export class SessionViewComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private destroyRef: DestroyRef,
    private headerService: HeaderService,
    private trainingSessionService: TrainingSessionService,
  ) {}

  sessionId = signal('');

  trainingSession: WritableSignal<TrainingSession | null> = signal(null);

  version = signal<number>(0);

  isLoaded = signal(false);

  exerciseData: WritableSignal<ExerciseDataDTO | null> = signal(null);

  trainingSessionExercises: WritableSignal<Exercise[]> = signal([]);

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
    forkJoin({
      sessionDto: this.trainingSessionService.getTrainingSessionById(this.sessionId()),
      exerciseData: this.trainingSessionService.loadExerciseData(),
    }).subscribe(({ sessionDto, exerciseData }) => {
      console.log('🚀 ~ SessionViewComponent ~ loadSessionData ~ exerciseData:', exerciseData);
      this.setHeadlineInfo(sessionDto);

      const trainingSession = TrainingSession.fromDto(sessionDto);
      this.trainingSession.set(trainingSession);

      this.exerciseData.set(exerciseData);

      const trainingSessionExercises = this.trainingSession()!.getExercisesDataForVersion(this.version());
      this.trainingSessionExercises.set(trainingSessionExercises);

      this.isLoaded.set(true);
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
