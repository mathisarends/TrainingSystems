import {
  Component,
  OnInit,
  AfterViewInit,
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
import { HttpErrorResponse } from '@angular/common/http';
import { SwipeService } from '../../../service/swipe/swipe.service';

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
export class TrainingViewComponent
  implements OnInit, AfterViewInit, AfterViewChecked
{
  title = '';
  trainingWeekIndex: number = 0;
  trainingDayIndex: number = 0;

  protected planId!: string;
  exerciseData: ExerciseDataDTO = new ExerciseDataDTO();
  trainingPlanData: TrainingPlanDto = new TrainingPlanDto();
  private dataViewLoaded = new BehaviorSubject<boolean>(false);
  dataViewLoaded$ = this.dataViewLoaded.asObservable();

  @ViewChildren('weightInput') weightInputs!: QueryList<ElementRef>;
  @ViewChild('trainingTable', { static: false }) trainingTable!: ElementRef;

  private swipeListenerInitialized = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private trainingViewService: TrainingViewService,
    private formService: FormService,
    private rpeService: RpeService,
    private estMaxService: EstMaxService,
    private renderer: Renderer2,
    private toastService: ToastService,
    private categoryPlaceholderService: CategoryPlaceholderService,
    private autoSaveService: AutoSaveService,
    private navigationService: TrainingViewNavigationService,
    private swipeService: SwipeService
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
  }

  /**
   * Lifecycle hook that is called after the component's view has been initialized.
   * Initializes RPE validation, estimated max calculation, and auto-save functionality.
   */
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.rpeService.initializeRPEValidation();
      this.estMaxService.initializeEstMaxCalculation();
      this.autoSaveService.initializeAutoSave();
    }
  }

  /**
   * Lifecycle hook that is called after the component's view has been checked.
   * Initializes the swipe listener once the data view has loaded.
   */
  ngAfterViewChecked(): void {
    if (isPlatformBrowser(this.platformId) && !this.swipeListenerInitialized) {
      const exerciseCategorySelectors = document.querySelectorAll(
        '.exercise-category-selector'
      ) as NodeListOf<HTMLSelectElement>;
      this.categoryPlaceholderService.handlePlaceholderCategory(
        exerciseCategorySelectors,
        this.renderer
      );

      if (this.dataViewLoaded.getValue() && this.trainingTable) {
        this.initializeSwipeListener();
        this.swipeListenerInitialized = true;
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
        () => this.onPageChanged(this.trainingDayIndex - 1)
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
    this.dataViewLoaded.next(false);
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
        catchError((error: unknown) => {
          if ((error as HttpErrorResponse).status !== 499) {
            console.error('Error loading training data:', error);
            return EMPTY;
          }
          return EMPTY;
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
          this.toastService.show(
            'Speichern erfolgreich',
            'Deine Änderungen wurden erfolgreich gespeichert'
          );
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
      event.target as HTMLSelectElement,
      this.renderer
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
      this.exerciseData.defaultRepSchemeByCategory,
      this.renderer
    );
  }

  /**
   * Handles page change events.
   * Navigates to the specified training day and reloads the data.
   * @param day - Index of the training day to navigate to.
   */

  onPageChanged(day: number): void {
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
      this.trainingPlanData
    );
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
}
