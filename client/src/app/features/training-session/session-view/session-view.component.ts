import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FormService } from '../../../core/services/form.service';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SkeletonTrainingTableComponent } from '../../../shared/components/loader/skeleton-training-table/skeleton-training-table.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';
import { IconName } from '../../../shared/icon/icon-name';
import { IconComponent } from '../../../shared/icon/icon.component';
import { AutoSaveService } from '../../../shared/service/auto-save.service';
import { HeaderService } from '../../header/header.service';
import { ExerciseDataService } from '../../training-plans/training-view/exercise-data.service';
import { ExerciseDataDTO } from '../../training-plans/training-view/exerciseDataDto';
import { EstMaxService } from '../../training-plans/training-view/services/estmax.service';
import { Exercise } from '../../training-plans/training-view/training-exercise';
import { TrainingSessionDto } from '../model/training-session-dto';
import { TrainingSession } from '../training-session';
import { TrainingSessionService } from '../training-session-service';

@Component({
  standalone: true,
  imports: [
    SkeletonTrainingTableComponent,
    InputComponent,
    DropdownComponent,
    CommonModule,
    PaginationComponent,
    IconComponent,
    TooltipDirective,
  ],
  selector: 'app-session-view',
  templateUrl: './session-view.component.html',
  styleUrls: ['./session-view.component.scss'],
  providers: [TrainingSessionService, EstMaxService],
})
export class SessionViewComponent implements OnInit {
  protected readonly IconName = IconName;

  /**
   * The ID of the current training session.
   */
  sessionId = signal('');

  /**
   * The current training session data.
   */
  trainingSession: WritableSignal<TrainingSession | null> = signal(null);

  /**
   * The current version of the training session.
   */
  version = signal<number>(0);

  /**
   * Indicates whether the component is loaded.
   */
  isLoaded = signal(false);

  /**
   * The exercise
   */
  exerciseData: WritableSignal<ExerciseDataDTO | null> = signal(null);

  /**
   * The exercises for the current training session.
   */

  trainingSessionExercises: WritableSignal<Exercise[]> = signal([]);

  constructor(
    private route: ActivatedRoute,
    private destroyRef: DestroyRef,
    private headerService: HeaderService,
    private trainingSessionService: TrainingSessionService,
    protected exerciseDataService: ExerciseDataService,
    private formService: FormService,
    private autoSaveService: AutoSaveService,
  ) {}

  ngOnInit() {
    this.initalizeAutoSaveServiceLogic();

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.headerService.setLoading();
      this.sessionId.set(params['sessionId']);

      const versionParam = Number(params['version']);
      this.version.set(versionParam);

      this.loadSessionData();
    });
  }

  /**
   * Loads the training session data and sets the component's state.
   */
  loadSessionData(): void {
    forkJoin({
      sessionDto: this.trainingSessionService.getTrainingSessionById(this.sessionId()),
      exerciseData: this.trainingSessionService.loadExerciseData(),
    }).subscribe(({ sessionDto, exerciseData }) => {
      this.setHeadlineInfo(sessionDto);

      const trainingSession = TrainingSession.fromDto(sessionDto);
      this.trainingSession.set(trainingSession);

      this.setExerciseMetadata(exerciseData);

      this.setTrainingSessionExercises();

      this.isLoaded.set(true);
    });
  }

  /**
   * Sets the exercise metadata for the current training session.
   *
   * @param exerciseData The exercise data to set.
   */
  private setExerciseMetadata(exerciseData: ExerciseDataDTO) {
    this.exerciseData.set(exerciseData);
    this.exerciseDataService.exerciseData = exerciseData;
  }

  /**
   * Sets the training session exercises for the current version.
   */
  private setTrainingSessionExercises() {
    const trainingSessionExercises = this.trainingSession()!.getExercisesDataForVersion(this.version());
    this.trainingSessionExercises.set(trainingSessionExercises);
  }

  /**
   * Sets the headline information for the current training session.
   *
   * @param trainingSession The training session data.
   */
  private setHeadlineInfo(trainingSesssion: TrainingSessionDto) {
    this.headerService.setHeadlineInfo({
      title: trainingSesssion.title,
      subTitle: `V${this.version()}`,
      buttons: [
        {
          icon: IconName.MORE_VERTICAL,
        },
      ],
    });
  }

  /**
   * Initializes the auto save service logic.
   */
  private initalizeAutoSaveServiceLogic() {
    this.autoSaveService.inputChanged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((option) => {
      const changes = this.formService.getChanges();
      this.trainingSessionService
        .updateTrainingSessionVersionData(this.sessionId(), this.version(), changes)
        .subscribe((response) => {});
    });
  }
}
