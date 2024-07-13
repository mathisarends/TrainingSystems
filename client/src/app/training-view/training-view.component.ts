import {
  Component,
  OnInit,
  AfterViewInit,
  AfterViewChecked,
  Renderer2,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TrainingDay } from '../../../../shared/models/training/trainingDay';
import { HttpClientService } from '../../service/http-client.service';
import { firstValueFrom } from 'rxjs';
import { HttpMethods } from '../types/httpMethods';
import { SpinnerComponent } from '../components/spinner/spinner.component';
import { FormService } from '../form.service';
import { RpeService } from '../rpe.service';
import { EstMaxService } from '../estmax.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryPlaceholderService } from '../category-placeholder.service';

interface TrainingPlanResponse {
  title: string;
  trainingWeekIndex: number;
  trainingDayIndex: number;
  trainingDay: TrainingDay;
  exerciseCategories: string[];
  categoryPauseTimes: { [key: string]: number };
  categorizedExercises: { [key: string]: string[] };
  defaultRepSchemeByCategory: {
    [key: string]: {
      defaultSets: number;
      defaultReps: number;
      defaultRPE: number;
    };
  };
  maxFactors: any;
}

@Component({
  selector: 'app-training-view',
  standalone: true,
  imports: [SpinnerComponent, CommonModule, FormsModule],
  templateUrl: './training-view.component.html',
  styleUrls: ['./training-view.component.scss'],
})
export class TrainingViewComponent
  implements OnInit, AfterViewInit, AfterViewChecked
{
  title: string = '';
  trainingWeekIndex: number = 0;
  trainingDayIndex: number = 0;
  exerciseCategories: string[] = [];
  categoryPauseTimes: { [key: string]: number } = {};
  categorizedExercises: { [key: string]: string[] } = {};
  defaultRepSchemeByCategory: {
    [key: string]: {
      defaultSets: number;
      defaultReps: number;
      defaultRPE: number;
    };
  } = {};
  maxFactors: any;
  trainingDay: TrainingDay = { exercises: [] };
  isLoading = true;
  isPlaceholderHandled = false;

  protected planId!: string;
  protected week!: number;
  protected day!: number;

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClientService,
    private formService: FormService,
    private rpeService: RpeService,
    private estMaxService: EstMaxService,
    private renderer: Renderer2,
    private el: ElementRef,
    private categoryPlaceholderService: CategoryPlaceholderService
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      this.planId = params['planId'];
      this.week = params['week'];
      this.day = params['day'];
      await this.loadTrainingPlan(this.planId, this.week, this.day);
      this.isLoading = false;
    });
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit called');
    this.rpeService.initializeRPEValidation();
    this.estMaxService.initializeEstMaxCalculation();
  }

  ngAfterViewChecked(): void {
    if (!this.isPlaceholderHandled) {
      const exerciseCategorySelectors = document.querySelectorAll(
        '.exercise-category-selector'
      ) as NodeListOf<HTMLSelectElement>;
      this.categoryPlaceholderService.handlePlaceholderCategory(
        exerciseCategorySelectors,
        this.renderer
      );
      this.isPlaceholderHandled = true;
    }
  }

  async loadTrainingPlan(
    planId: string,
    week: number,
    day: number
  ): Promise<void> {
    try {
      const response: TrainingPlanResponse = await firstValueFrom(
        this.httpClient.request<TrainingPlanResponse>(
          HttpMethods.GET,
          `training/plan/${planId}/${week}/${day}`
        )
      );

      console.log('response', response);

      this.title = response.title;
      this.trainingWeekIndex = response.trainingWeekIndex;
      this.trainingDayIndex = response.trainingDayIndex;
      this.exerciseCategories = response.exerciseCategories;
      this.categoryPauseTimes = response.categoryPauseTimes;
      this.categorizedExercises = response.categorizedExercises;
      this.defaultRepSchemeByCategory = response.defaultRepSchemeByCategory;
      this.maxFactors = response.maxFactors;
      this.trainingDay = response.trainingDay;
    } catch (error) {
      console.error('Error loading training plan:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const changedData = this.formService.getChanges();
    console.log('Changed Data:', changedData);

    try {
      await firstValueFrom(
        this.httpClient.request<any>(
          HttpMethods.PATCH,
          `training/plan/${this.planId}/${this.week}/${this.day}`,
          { body: changedData }
        )
      );
      console.log('Plan successfully updated');
      this.formService.clearChanges(); // Clear changes after submission
    } catch (error) {
      console.error('Error updating training plan:', error);
    }
    try {
      await firstValueFrom(
        this.httpClient.request<any>(
          HttpMethods.PATCH,
          `training/plan/${this.planId}/${this.week}/${this.day}`,
          { body: changedData }
        )
      );
      console.log('Plan successfully updated');
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
      this.exerciseCategories,
      this.defaultRepSchemeByCategory,
      this.renderer
    );
  }
}
