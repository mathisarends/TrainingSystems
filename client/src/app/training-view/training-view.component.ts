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
import { FormService } from '../form.service';
import { RpeService } from '../rpe.service';
import { EstMaxService } from '../estmax.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryPlaceholderService } from '../category-placeholder.service';
import { ToastService } from '../toast/toast.service';
import { SpinnerComponent } from '../components/spinner/spinner.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { ExerciseDataDTO } from './exerciseDataDto';
import { TrainingPlanDto } from './trainingPlanDto';
import { AutoSaveService } from '../auto-save.service';
import { TrainingViewNavigationService } from './training-view-navigation.service';
import { forkJoin, BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { SwipeService } from '../../service/swipe/swipe.service';

@Component({
  selector: 'app-training-view',
  standalone: true,
  imports: [
    SpinnerComponent,
    CommonModule,
    FormsModule,
    PaginationComponent,
    ProgressBarComponent,
  ],
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

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.planId = params['planId'];
      this.trainingWeekIndex = parseInt(params['week']);
      this.trainingDayIndex = parseInt(params['day']);

      this.loadData(this.planId, this.trainingWeekIndex, this.trainingDayIndex);
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.rpeService.initializeRPEValidation();
      this.estMaxService.initializeEstMaxCalculation();
      this.autoSaveService.initializeAutoSave();
    }

    /*     this.dataViewLoaded$.pipe(take(1)).subscribe(() => {
      this.initializeSwipeListener();
    }); */
  }

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

  initializeSwipeListener(): void {
    if (this.trainingTable) {
      this.swipeService.addSwipeListener(
        this.trainingTable.nativeElement,
        () => this.onPageChanged(this.trainingDayIndex + 1),
        () => this.onPageChanged(this.trainingDayIndex - 1)
      );
      console.log('Swipe listener initialized');
    }
  }

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
          this.title = trainingPlan.title;
        }),
        catchError((error: unknown) => {
          if ((error as HttpErrorResponse).status !== 499) {
            console.error('Error loading training data:', error);
            return EMPTY;
          }
          return EMPTY;
        }),
        tap(() => this.dataViewLoaded.next(true))
      )
      .subscribe();
  }

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

  onInputChange(event: Event): void {
    this.formService.trackChange(event);
    this.categoryPlaceholderService.updatePlaceholderVisibility(
      event.target as HTMLSelectElement,
      this.renderer
    );
  }

  onCategoryChange(event: Event): void {
    this.categoryPlaceholderService.onCategoryChange(
      event,
      this.exerciseData.exerciseCategories,
      this.exerciseData.defaultRepSchemeByCategory,
      this.renderer
    );
  }

  onPageChanged(day: number): void {
    this.trainingDayIndex = this.navigationService.navigateDay(
      day,
      this.trainingPlanData.trainingFrequency,
      this.trainingWeekIndex
    );
  }

  navigateWeek(direction: number): void {
    this.trainingWeekIndex = this.navigationService.navigateWeek(
      this.trainingWeekIndex,
      direction,
      this.trainingPlanData
    );

    this.trainingViewService.loadTrainingPlan(
      this.planId,
      this.trainingWeekIndex,
      this.trainingDayIndex
    );
  }

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
