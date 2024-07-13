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

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClientService,
    private formService: FormService,
    private rpeService: RpeService,
    private estMaxService: EstMaxService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  async ngOnInit() {
    this.route.params.subscribe(async (params) => {
      const planId = params['planId'];
      const week = params['week'];
      const day = params['day'];
      await this.loadTrainingPlan(planId, week, day);
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
      this.handlePlaceholderCategory();
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

    const planId = this.route.snapshot.paramMap.get('planId');
    const week = +this.route.snapshot.paramMap.get('week')!;
    const day = +this.route.snapshot.paramMap.get('day')!;

    try {
      await firstValueFrom(
        this.httpClient.request<any>(
          HttpMethods.PATCH,
          `training/plan/${planId}/${week}/${day}`,
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
    this.updatePlaceholderVisibility(event.target as HTMLSelectElement);
  }

  onCategoryChange(event: Event): void {
    // ...existing code...
  }

  handlePlaceholderCategory(): void {
    console.log('handlePlaceholderCategory called');
    const exerciseCategorySelectors = document.querySelectorAll(
      '.exercise-category-selector'
    ) as NodeListOf<HTMLSelectElement>;
    console.log(
      '🚀 ~ TrainingViewComponent ~ handlePlaceholderCategory ~ exerciseCategorySelectors:',
      exerciseCategorySelectors
    );

    // Remove all Placeholder categories at the beginning
    exerciseCategorySelectors.forEach((categorySelector) => {
      const category = categorySelector.value;

      if (category === '- Bitte Auswählen -' || category === undefined) {
        this.renderer.setStyle(categorySelector, 'opacity', '0');
      }
    });
  }

  updatePlaceholderVisibility(target: HTMLSelectElement): void {
    if (target.value !== '- Bitte Auswählen -') {
      this.renderer.setStyle(target, 'opacity', '1');
    } else {
      this.renderer.setStyle(target, 'opacity', '0');
    }
  }

  getIndexByCategory(category: string): number {
    return this.exerciseCategories.indexOf(category);
  }
}
