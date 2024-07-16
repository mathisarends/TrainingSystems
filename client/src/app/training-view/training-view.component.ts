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
import { TrainingService } from './training-view-service';
import { FormService } from '../form.service';
import { RpeService } from '../rpe.service';
import { EstMaxService } from '../estmax.service';
import { CategoryPlaceholderService } from '../category-placeholder.service';
import { ToastService } from '../toast/toast.service';
import { ToastType } from '../toast/toastType';
import { AutoSaveService } from '../auto-save.service';
import { PauseTimeService } from '../pause-time.service';
import { ExerciseDataDTO } from './exerciseDataDto';
import { TrainingPlanDto } from './trainingPlanDto';
import { SpinnerComponent } from '../components/spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../pagination/pagination.component';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';

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
    private trainingService: TrainingService,
    private formService: FormService,
    private rpeService: RpeService,
    private estMaxService: EstMaxService,
    private renderer: Renderer2,
    private toastService: ToastService,
    private categoryPlaceholderService: CategoryPlaceholderService,
    private autoSaveService: AutoSaveService,
    private pauseTimeService: PauseTimeService
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      this.planId = params['planId'];
      this.trainingWeekIndex = parseInt(params['week']);
      this.trainingDayIndex = parseInt(params['day']);

      // Fetch both training plan and exercise data in parallel
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
      await Promise.all([
        this.loadTrainingPlan(planId, week, day),
        this.loadExerciseData(),
      ]);
    } catch (error) {
      console.error('Error loading data:', (error as unknown as Error).message);
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
      const response = await this.trainingService.loadTrainingPlan(
        planId,
        week,
        day
      );
      this.title = response.title;
      this.trainingPlanData.setData(response);
    } catch (error) {
      console.error('Error loading training plan:', error);
    }
  }

  async loadExerciseData(): Promise<void> {
    try {
      this.exerciseData = await this.trainingService.loadExerciseData();
    } catch (error) {
      console.error('Error loading exercise data:', error);
    }
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const changedData = this.formService.getChanges();

    try {
      await this.trainingService.submitTrainingPlan(
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

  onWeightInputChange() {
    console.log('changed weight value');
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
    this.navigateDay(day);
  }

  navigateDay(day: number): void {
    if (day >= 0 && day <= this.trainingPlanData!.trainingFrequency - 1) {
      this.trainingDayIndex = day;

      this.router.navigate([], {
        queryParams: {
          week: this.trainingWeekIndex,
          day: this.trainingDayIndex,
        },
        queryParamsHandling: 'merge',
      });
    }

    this.clearInputValues();
  }

  navigateWeek(direction: number) {
    let week = 0;

    if (this.trainingWeekIndex === 0 && direction === -1) {
      week = this.trainingPlanData!.trainingBlockLength - 1;
    } else if (
      this.trainingWeekIndex ===
        this.trainingPlanData!.trainingBlockLength - 1 &&
      direction === 1
    ) {
      week = 0;
    } else {
      week = this.trainingWeekIndex + direction;
    }

    this.router.navigate([], {
      queryParams: {
        week: week,
        day: this.trainingDayIndex,
      },
      queryParamsHandling: 'merge',
    });

    this.clearInputValues();

    this.loadTrainingPlan(this.planId, week, this.trainingDayIndex);
  }

  async submitUnchangedData() {
    const changedData = this.formService.getChanges();

    await this.trainingService.submitTrainingPlan(
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

    this.clearInputValues();
  }

  clearInputValues() {
    const changedData = this.formService.getChanges();

    for (const name in changedData) {
      if (changedData.hasOwnProperty(name)) {
        const inputElement = document.querySelector(`[name="${name}"]`) as
          | HTMLInputElement
          | HTMLSelectElement;
        if (
          inputElement &&
          inputElement.classList.contains('exercise-category-selector')
        ) {
          inputElement.value = '- Bitte Auswählen -';
          inputElement.dispatchEvent(new Event('change'));
        } else if (inputElement) {
          inputElement.value = '';
        }
      }
    }

    this.formService.clearChanges();
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
