import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  Injector,
  OnInit,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FormService } from '../../../core/services/form.service';
import { BasicInfoModalOptionsBuilder } from '../../../core/services/modal/basic-info/basic-info-modal-options-builder';
import { ModalService } from '../../../core/services/modal/modal.service';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SkeletonTrainingTableComponent } from '../../../shared/components/loader/skeleton-training-table/skeleton-training-table.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SwipeDirective } from '../../../shared/directives/swipe.directive';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';
import { IconName } from '../../../shared/icon/icon-name';
import { IconComponent } from '../../../shared/icon/icon.component';
import { AutoSaveService } from '../../../shared/service/auto-save.service';
import { HeaderService } from '../../header/header.service';
import { SetHeadlineInfo } from '../../header/set-headline-info';
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
    SwipeDirective,
  ],
  selector: 'app-session-view',
  templateUrl: './session-view.component.html',
  styleUrls: ['./session-view.component.scss'],
  providers: [TrainingSessionService, ExerciseDataService, EstMaxService],
})
export class SessionViewComponent implements OnInit, SetHeadlineInfo {
  @ViewChild('trainingTable') trainingTable!: ElementRef;
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
    private router: Router,
    private destroyRef: DestroyRef,
    private headerService: HeaderService,
    private modalService: ModalService,
    private trainingSessionService: TrainingSessionService,
    protected exerciseDataService: ExerciseDataService,
    private formService: FormService,
    private autoSaveService: AutoSaveService,
    private cdr: ChangeDetectorRef,
    private injector: Injector,
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

  ngAfterViewInit() {
    effect(
      () => {
        if (this.isLoaded()) {
          this.cdr.detectChanges(); // wait for dom update after view is loaded
        }
      },
      { injector: this.injector },
    );
  }

  /**
   * Loads the training session data and sets the component's state.
   */
  loadSessionData(): void {
    this.isLoaded.set(false);

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
   * Sets the headline information for the current training session.
   *
   * @param trainingSession The training session data.
   */
  setHeadlineInfo(trainingSesssion: TrainingSessionDto) {
    this.headerService.setHeadlineInfo({
      title: trainingSesssion.title,
      subTitle: `V${this.version()}`,
      buttons: [
        {
          icon: IconName.MORE_VERTICAL,
          options: [{ label: 'Trainieren', icon: IconName.Activity, callback: this.startNewSesson.bind(this) }],
        },
      ],
    });
  }

  protected navigateToVersion(version: number) {
    if (version < 1) {
      return;
    }

    if (version > this.trainingSession()!.versions().length) {
      return;
    }

    this.router.navigate(['/session/view'], {
      queryParams: {
        sessionId: this.sessionId(),
        version: version,
      },
    });
  }

  /**
   * Sets the exercise metadata for the current training session.
   *
   * @param exerciseData The exercise data to set.
   */
  private setExerciseMetadata(exerciseData: ExerciseDataDTO) {
    this.exerciseData.set(exerciseData);
    this.exerciseDataService.setExerciseData(exerciseData);
  }

  /**
   * Sets the training session exercises for the current version.
   */
  private setTrainingSessionExercises() {
    const trainingSessionExercises = this.trainingSession()!.getExercisesDataForVersion(this.version());
    this.trainingSessionExercises.set(trainingSessionExercises);
  }

  private startNewSesson() {
    const basicInfoModalOptions = new BasicInfoModalOptionsBuilder()
      .setTitle('Neues Training')
      .setInfoText('Bist du dir sicher, dass du ein neues Training starten willst?')
      .setButtonText('Starten')
      .setOnSubmitCallback(async () => this.startNewTrainingSession())
      .build();

    this.modalService.openBasicInfoModal(basicInfoModalOptions);
  }

  private startNewTrainingSession(): void {
    this.trainingSessionService.startNewTrainingSession(this.sessionId()).subscribe((response) => {
      this.router.navigate(['/session/view'], {
        queryParams: {
          sessionId: this.sessionId(),
          version: response.version,
        },
      });
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

  protected swipeLeft = () => this.navigateToVersion(this.version() + 1);
  protected swipeRight = () => this.navigateToVersion(this.version() - 1);
}
