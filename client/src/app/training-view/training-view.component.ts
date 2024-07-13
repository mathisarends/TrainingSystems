import {
  Component,
  OnInit,
  AfterViewInit,
  AfterViewChecked,
} from '@angular/core';
import { TrainingDay } from '../../../../shared/models/training/trainingDay';
import { HttpClientService } from '../../service/http-client.service';
import { firstValueFrom } from 'rxjs';
import { HttpMethods } from '../types/httpMethods';
import { SpinnerComponent } from '../components/spinner/spinner.component';
import { FormService } from '../form.service';
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
    private httpClient: HttpClientService,
    private formService: FormService
  ) {}

  async ngOnInit() {
    const planId = '65544090-343a-49a4-9176-17e19a177842';
    const week = 1;
    const day = 1;
    await this.loadTrainingPlan(planId, week, day);
    this.isLoading = false;
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit called');
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

  onSubmit(event: Event): void {
    event.preventDefault();
    const changedData = this.formService.getChanges();
    console.log('Changed Data:', changedData);
    // Handle form submission logic here
    this.formService.clearChanges(); // Clear changes after submission
  }

  onInputChange(event: Event): void {
    this.formService.trackChange(event);
    this.updatePlaceholderVisibility(event.target as HTMLSelectElement);
  }

  onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const category = target.value;
    const tableRow = target.closest('tr');

    if (tableRow) {
      const exerciseNameSelectors = tableRow.querySelectorAll(
        '.exercise-name-selector'
      ) as NodeListOf<HTMLSelectElement>;

      if (category === '- Bitte Auswählen -') {
        exerciseNameSelectors.forEach((selector) => {
          selector.style.display = 'none';
          selector.disabled = false;
        });
      } else {
        const index = this.getIndexByCategory(category);
        exerciseNameSelectors.forEach((selector, i) => {
          selector.style.display = i === index ? 'block' : 'none';
          selector.style.opacity = i === index ? '1' : '0';
          selector.disabled = i !== index;
        });
      }

      const displaySelector = tableRow.querySelector(
        '.exercise-name-selector:not([style*="display: none"])'
      ) as HTMLSelectElement;
      if (displaySelector) {
        displaySelector.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
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
        categorySelector.style.opacity = '0';
      }
    });
  }

  updatePlaceholderVisibility(target: HTMLSelectElement): void {
    if (target.value !== '- Bitte Auswählen -') {
      target.style.opacity = '1';
    } else {
      target.style.opacity = '0';
    }
  }

  getIndexByCategory(category: string): number {
    return this.exerciseCategories.indexOf(category);
  }
}
