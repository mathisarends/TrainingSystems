import {
  Component,
  OnInit,
  AfterViewChecked,
  Renderer2,
  Inject,
  PLATFORM_ID,
  ViewChildren,
  ElementRef,
  QueryList,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TrainingViewService } from './training-view-service';
import { FormService } from '../../../service/form/form.service';
import { RpeService } from '../../../service/training/rpe.service';
import { EstMaxService } from '../../../service/training/estmax.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryPlaceholderService } from '../../../service/training/category-placeholder.service';
import { ToastService } from '../../components/toast/toast.service';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ExerciseDataDTO } from './exerciseDataDto';
import { TrainingPlanDto } from './trainingPlanDto';
import { AutoSaveService } from '../../../service/training/auto-save.service';
import { TrainingViewNavigationService } from './training-view-navigation.service';
import { forkJoin, BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SwipeService } from '../../../service/swipe/swipe.service';
import { MobileService } from '../../../service/util/mobile.service';

import { PauseTimeService } from '../../../service/training/pause-time.service';
import { ModalService } from '../../../service/modal/modalService';
import { RestTimerComponent } from '../../rest-timer/rest-timer.component';
import { SpeechToTextComponent } from '../../speech-to-text/speech-to-text.component';
import { TrainingViewNavigationComponent } from '../../training-view-navigation/training-view-navigation.component';
import { ModalSize } from '../../../service/modal/modalSize';
import { BasicInfoComponent } from '../../basic-info/basic-info.component';
import { HttpClientService } from '../../../service/http/http-client.service';
import { HttpMethods } from '../../types/httpMethods';

/**
 * Component to manage and display the training view.
 * Handles loading of training data, swipe gestures, and form submissions.
 */
@Component({
  selector: 'app-training-view',
  standalone: true,
  imports: [SpinnerComponent, CommonModule, FormsModule, PaginationComponent],
  templateUrl: './training-view.component.html',
  styleUrls: ['./training-view.component.scss'],
})
export class TrainingViewComponent implements OnInit, AfterViewChecked {
  title = '';
  trainingWeekIndex: number = 0;
  trainingDayIndex: number = 0;

  protected planId!: string;
  exerciseData: ExerciseDataDTO = new ExerciseDataDTO();
  trainingPlanData: TrainingPlanDto = new TrainingPlanDto();
  private dataViewLoaded = new BehaviorSubject<boolean>(false);
  dataViewLoaded$ = this.dataViewLoaded.asObservable();

  private automationContextInitialized = false;
  isMobile = false;

  @ViewChildren('weightInput') weightInputs!: QueryList<ElementRef>;
  @ViewChild('trainingTable', { static: false }) trainingTable!: ElementRef;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private trainingViewService: TrainingViewService,
    private formService: FormService,
    private rpeService: RpeService,
    private estMaxService: EstMaxService,
    private toastService: ToastService,
    private categoryPlaceholderService: CategoryPlaceholderService,
    private autoSaveService: AutoSaveService,
    private navigationService: TrainingViewNavigationService,
    private swipeService: SwipeService,
    private pauseTimeService: PauseTimeService,
    private mobileService: MobileService,
    private modalService: ModalService,
    private httpService: HttpClientService
  ) {}

  /**
   * Initializes the component.
   * Subscribes to route parameters and loads the initial data.
   */
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.planId = params['planId'];
      this.trainingWeekIndex = parseInt(params['week']);
      this.trainingDayIndex = parseInt(params['day']);

      this.loadData(this.planId, this.trainingWeekIndex, this.trainingDayIndex);
    });

    this.isMobile = this.mobileService.isMobileView();
  }

  /**
   * Lifecycle hook that is called after the component's view has been checked.
   * Initializes the swipe listener once the data view has loaded.
   */
  ngAfterViewChecked(): void {
    if (
      isPlatformBrowser(this.platformId) &&
      !this.automationContextInitialized
    ) {
      if (this.dataViewLoaded.getValue() && this.trainingTable) {
        this.initializeSwipeListener();

        this.categoryPlaceholderService.handlePlaceholderCategory();

        this.rpeService.initializeRPEValidation();
        this.estMaxService.initializeEstMaxCalculation();
        this.autoSaveService.initializeAutoSave();
        this.pauseTimeService.initializePauseTimers(this.exerciseData);

        this.automationContextInitialized = true;
      }
    }
  }

  /**
   * Initializes the swipe listener on the training table element.
   * Registers callbacks for left and right swipe gestures.
   */
  initializeSwipeListener(): void {
    if (this.trainingTable) {
      this.swipeService.addSwipeListener(
        this.trainingTable.nativeElement,
        () => this.onPageChanged(this.trainingDayIndex + 1),
        () => this.onPageChanged(this.trainingDayIndex - 1),
        () => {
          this.navigateWeek(-1);
        },
        () => {
          this.navigateWeek(1);
        }
      );
    }
  }

  /**
   * Removes the swipe listener.
   * Calls the swipe service to remove the registered listeners.
   */
  removeSwipeListener(): void {
    this.swipeService.removeSwipeListener();
  }

  /**
   * Loads training data and exercise data for the specified plan, week, and day.
   * Updates the component state with the loaded data.
   * @param planId - ID of the training plan.
   * @param week - Index of the training week.
   * @param day - Index of the training day.
   */
  loadData(planId: string, week: number, day: number): void {
    /* this.dataViewLoaded.next(false); */
    forkJoin({
      trainingPlan: this.trainingViewService.loadTrainingPlan(
        planId,
        week,
        day
      ),
      exerciseData: this.trainingViewService.loadExerciseData(),
    })
      .pipe(
        tap(({ trainingPlan, exerciseData }) => {
          this.trainingPlanData = trainingPlan;
          this.exerciseData = exerciseData;
          this.title = trainingPlan?.title;
        }),
        tap(() => {
          if (this.trainingPlanData && this.exerciseData && this.title) {
            this.dataViewLoaded.next(true);
            this.removeSwipeListener();
            this.initializeSwipeListener();
          } else {
            this.dataViewLoaded.next(false);
          }
        })
      )
      .subscribe();
  }

  /**
   * Handles form submission.
   * Prevents default form submission, collects changed data, and submits the training plan.
   * @param event - The form submission event.
   */
  onSubmit(event: Event): void {
    event.preventDefault();
    const changedData = this.formService.getChanges();

    this.trainingViewService
      .submitTrainingPlan(
        this.planId,
        this.trainingWeekIndex,
        this.trainingDayIndex,
        changedData
      )
      .pipe(
        tap(() => {
          this.toastService.show('Erfolg', 'Daten gespeichert');
          this.formService.clearChanges(); // Clear changes after submission
        }),
        catchError((error) => {
          console.error('Error updating training plan:', error);
          return [];
        })
      )
      .subscribe();
  }

  /**
   * Handles input change events.
   * Tracks changes in the form service and updates the visibility of exercise category placeholders.
   * @param event - The input change event.
   */
  onInputChange(event: Event): void {
    this.formService.trackChange(event);
    this.categoryPlaceholderService.updatePlaceholderVisibility(
      event.target as HTMLSelectElement
    );
  }

  /**
   * Handles category change events.
   * Updates exercise categories and rep schemes based on the selected category.
   * @param event - The category change event.
   */
  onCategoryChange(event: Event): void {
    this.categoryPlaceholderService.onCategoryChange(
      event,
      this.exerciseData.exerciseCategories,
      this.exerciseData.defaultRepSchemeByCategory
    );
  }

  /**
   * Handles page change events.
   * Checks for unsaved data and
   */

  async onPageChanged(day: number): Promise<void> {
    if (this.formService.hasUnsavedChanges()) {
      const confirmed = await this.modalService.open({
        component: BasicInfoComponent,
        title: 'Ungespeicherte Änderungen',
        buttonText: 'Änderungen verwerfen',
        componentData: {
          text: 'Es gibt ungespeicherte Änderungen. Möchtest du wirklich fortfahren und die Änderungen verwerfen?',
        },
      });

      if (confirmed) this.navigateDay(day);
    } else {
      this.navigateDay(day);
    }
  }

  navigateDay(day: number) {
    if (day >= this.trainingPlanData.trainingBlockLength) {
      day = 0;
    } else if (day < 0) {
      day = this.trainingPlanData.trainingBlockLength - 1;
    }

    this.trainingDayIndex = this.navigationService.navigateDay(
      day,
      this.trainingPlanData.trainingFrequency,
      this.trainingWeekIndex
    );

    this.automationContextInitialized = false;
    this.loadData(this.planId, this.trainingWeekIndex, this.trainingDayIndex);
  }

  /**
   * Navigates to the specified training week.
   * Reloads the training data for the new week.
   * @param direction - Direction to navigate (1 for next week, -1 for previous week).
   */
  navigateWeek(direction: number): void {
    this.trainingWeekIndex = this.navigationService.navigateWeek(
      this.trainingWeekIndex,
      direction,
      this.trainingPlanData,
      this.trainingDayIndex
    );
    this.automationContextInitialized = false;
    this.loadData(this.planId, this.trainingWeekIndex, this.trainingDayIndex);
  }

  /**
   * Retrieves the exercise data for the specified index.
   * @param index - Index of the exercise.
   * @returns The exercise data object.
   */
  getExercise(index: number): any {
    return (
      this.trainingPlanData!.trainingDay?.exercises[index - 1] || {
        category: '',
        exercise: '',
        sets: '',
        reps: '',
        weight: '',
        targetRPE: '',
        actualRPE: '',
        estMax: '',
      }
    );
  }

  switchToTimerView(event: Event) {
    event.preventDefault();

    this.modalService.open({
      component: RestTimerComponent,
      title: 'Pause Timer',
      buttonText: 'Abbrechen',
      hasFooter: false,
    });
  }

  openNavigationMenu() {
    this.modalService.open({
      component: TrainingViewNavigationComponent,
      title: 'Navigationshinweise',
      buttonText: 'Fertig',
      size: ModalSize.MEDIUM,
      hasFooter: false,
    });
  }

  // TODO: automatisch ende der Spracherkennung erkennen und string parsen und damit daten verarbeiten automatisch in die felder setze nund so.
  recordTrainingData(event: Event) {
    event.preventDefault();

    const exercises = this.trainingPlanData.trainingDay.exercises;
    console.log(
      '🚀 ~ TrainingViewComponent ~ recordTrainingData ~ exercises:',
      exercises
    );

    this.httpService
      .request<any>(HttpMethods.GET, 'user/profile-picture')
      .subscribe((response) => {
        this.modalService.open({
          component: SpeechToTextComponent,
          title: 'Übungen eintragen',
          buttonText: 'Übernhmen',
          hasFooter: false,
          componentData: {
            profilePictureUrl: response,
            exercises: exercises,
          },
        });
      });
  }
}
