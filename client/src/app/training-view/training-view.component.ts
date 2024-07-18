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
  input,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientService } from '../../service/http-client.service';
import { catchError, firstValueFrom } from 'rxjs';
import { HttpMethods } from '../types/httpMethods';
import { SpinnerComponent } from '../components/spinner/spinner.component';
import { FormService } from '../form.service';
import { RpeService } from '../rpe.service';
import { EstMaxService } from '../estmax.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryPlaceholderService } from '../category-placeholder.service';
import { ToastService } from '../toast/toast.service';
import { ToastType } from '../toast/toastType';
import { PaginationComponent } from '../pagination/pagination.component';

import { ExerciseDataDTO } from './exerciseDataDto';
import { AutoSaveService } from '../auto-save.service';
import { TrainingPlanDto } from './trainingPlanDto';
import { PauseTimeService } from '../pause-time.service';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { HttpErrorResponse } from '@angular/common/http';

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
    private httpClient: HttpClientService,
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
      await this.loadTrainingPlan(planId, week, day);
      await this.loadExerciseData();
    } catch (error) {
      console.error('Error loading training data:', error);
    } finally {
      // wilde code anordnung hier

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
      const response: TrainingPlanDto = await firstValueFrom(
        this.httpClient.request<TrainingPlanDto>(
          HttpMethods.GET,
          `training/plan/${planId}/${week}/${day}`
        )
      );

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
      const response = await firstValueFrom(
        this.httpClient.request<ExerciseDataDTO>(
          HttpMethods.GET,
          'exercise/training'
        )
      );
      this.exerciseData = new ExerciseDataDTO(response);
    } catch (error) {}
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const changedData = this.formService.getChanges();

    try {
      await firstValueFrom(
        this.httpClient.request<any>(
          HttpMethods.PATCH,
          `training/plan/${this.planId}/${this.trainingWeekIndex}/${this.trainingDayIndex}`,
          { body: changedData }
        )
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
    this.navigateDay(day);
  }

  navigateDay(day: number): void {
    if (day >= 0 && day <= this.trainingPlanData!.trainingFrequency - 1) {
      // use trainingPlanData
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
      week = this.trainingPlanData!.trainingBlockLength - 1; // use trainingPlanData
    } else if (
      this.trainingWeekIndex ===
        this.trainingPlanData!.trainingBlockLength - 1 && // use trainingPlanData
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

    await firstValueFrom(
      this.httpClient.request<any>(
        HttpMethods.PATCH,
        `training/plan/${this.planId}/${this.trainingWeekIndex}/${this.trainingDayIndex}`,
        { body: changedData }
      )
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
          // its a category selector
          inputElement.value = '- Bitte Auswählen -';
          inputElement.dispatchEvent(new Event('change'));
        } else if (inputElement) {
          inputElement.value = '';
        }
      }
    }

    // Clear the changes in the service
    this.formService.clearChanges();
  }
  getExercise(index: number) {
    return (
      this.trainingPlanData!.trainingDay?.exercises[index - 1] || {
        // use trainingPlanData
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
