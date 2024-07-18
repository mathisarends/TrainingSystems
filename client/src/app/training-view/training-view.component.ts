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
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingViewService } from './training-view-service';
import { FormService } from '../form.service';
import { RpeService } from '../rpe.service';
import { EstMaxService } from '../estmax.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryPlaceholderService } from '../category-placeholder.service';
import { ToastService } from '../toast/toast.service';
import { ToastType } from '../toast/toastType';
import { SpinnerComponent } from '../components/spinner/spinner.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { ExerciseDataDTO } from './exerciseDataDto';
import { TrainingPlanDto } from './trainingPlanDto';
import { PauseTimeService } from '../pause-time.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AutoSaveService } from '../auto-save.service';
import { TrainingViewNavigationService } from './training-view-navigation.service';

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
  isLoading = true;

  @ViewChildren('weightInput') weightInputs!: QueryList<ElementRef>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private router: Router,
    private trainingViewService: TrainingViewService,
    private formService: FormService,
    private rpeService: RpeService,
    private estMaxService: EstMaxService,
    private renderer: Renderer2,
    private toastService: ToastService,
    private categoryPlaceholderService: CategoryPlaceholderService,
    private autoSaveService: AutoSaveService,
    private pauseTimeService: PauseTimeService,
    private navigationService: TrainingViewNavigationService
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      this.planId = params['planId'];
      this.trainingWeekIndex = parseInt(params['week']);
      this.trainingDayIndex = parseInt(params['day']);

      await this.loadData(
        this.planId,
        this.trainingWeekIndex,
        this.trainingDayIndex
      );
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log('ngAfterViewInit called');
      this.rpeService.initializeRPEValidation();
      this.estMaxService.initializeEstMaxCalculation();
      this.autoSaveService.initializeAutoSave();
    }
  }

  ngAfterViewChecked(): void {
    if (isPlatformBrowser(this.platformId)) {
      const exerciseCategorySelectors = document.querySelectorAll(
        '.exercise-category-selector'
      ) as NodeListOf<HTMLSelectElement>;
      this.categoryPlaceholderService.handlePlaceholderCategory(
        exerciseCategorySelectors,
        this.renderer
      );
    }
  }

  async loadData(planId: string, week: number, day: number): Promise<void> {
    try {
      await this.loadTrainingPlan(planId, week, day);
      await this.loadExerciseData();
    } catch (error) {
      console.error('Error loading training data:', error);
    } finally {
      if (isPlatformBrowser(this.platformId)) {
        this.pauseTimeService.initializePauseTimers(
          this.exerciseData.categoryPauseTimes
        );
      }

      this.isLoading = false;
    }
  }

  async loadTrainingPlan(
    planId: string,
    week: number,
    day: number
  ): Promise<void> {
    try {
      const response: TrainingPlanDto =
        await this.trainingViewService.loadTrainingPlan(planId, week, day);
      this.title = response.title;
      this.trainingPlanData.setData(response);
    } catch (error) {
      if ((error as HttpErrorResponse).status !== 499) {
        console.error('Error while loading training plan', error);
      }
    }
  }

  async loadExerciseData(): Promise<void> {
    try {
      const response = await this.trainingViewService.loadExerciseData();
      this.exerciseData = new ExerciseDataDTO(response);
    } catch (error) {}
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const changedData = this.formService.getChanges();

    try {
      await this.trainingViewService.submitTrainingPlan(
        this.planId,
        this.trainingWeekIndex,
        this.trainingDayIndex,
        changedData
      );
      this.toastService.show(
        'Speichern erfolgreich',
        'Deine Änderungen wurden erfolgreich gespeichert',
        ToastType.INFO,
        { delay: 5000 }
      );
      this.formService.clearChanges(); // Clear changes after submission
    } catch (error) {
      console.error('Error updating training plan:', error);
    }
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

  navigateWeek(direction: number) {
    this.trainingWeekIndex = this.navigationService.navigateWeek(
      this.trainingWeekIndex,
      direction,
      this.trainingPlanData
    );

    this.loadTrainingPlan(
      this.planId,
      this.trainingWeekIndex,
      this.trainingDayIndex
    );
  }

  getExercise(index: number) {
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
