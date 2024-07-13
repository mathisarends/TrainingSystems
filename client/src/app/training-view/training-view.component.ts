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
    this.initializeRPEValidation();
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

      // Set default values based on category
      const setsInput = tableRow.querySelector('.sets') as HTMLInputElement;
      const repsInput = tableRow.querySelector('.reps') as HTMLInputElement;
      const targetRPEInput = tableRow.querySelector(
        '.targetRPE'
      ) as HTMLInputElement;

      if (category !== '- Bitte Auswählen -') {
        const defaultValues = this.defaultRepSchemeByCategory[category];
        if (defaultValues) {
          setsInput.value = defaultValues.defaultSets.toString();
          repsInput.value = defaultValues.defaultReps.toString();
          targetRPEInput.value = defaultValues.defaultRPE.toString();
        }
      } else {
        setsInput.value = '';
        repsInput.value = '';
        targetRPEInput.value = '';
      }

      setsInput.dispatchEvent(new Event('change', { bubbles: true }));
      repsInput.dispatchEvent(new Event('change', { bubbles: true }));
      targetRPEInput.dispatchEvent(new Event('change', { bubbles: true }));
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

  initializeRPEValidation(): void {
    const MIN_RPE = 5;
    const MAX_RPE = 10;

    const changeEvent = new Event('change', { bubbles: true });

    const validateRPE = (rpe: number, rpeInput: HTMLInputElement) => {
      switch (true) {
        case rpe < MIN_RPE:
          rpeInput.value = MIN_RPE.toString();
          break;
        case rpe > MAX_RPE:
          rpeInput.value = MAX_RPE.toString();
          break;
        default:
          rpeInput.value = rpe.toString();
      }
      rpeInput.dispatchEvent(changeEvent);
    };

    const targetRPEInputs = document.querySelectorAll(
      '.targetRPE'
    ) as NodeListOf<HTMLInputElement>;
    targetRPEInputs.forEach((input) => {
      input.addEventListener('change', (e) => {
        const targetRPEInput = e.target as HTMLInputElement;
        const targetRPE: number = parseInt(targetRPEInput.value);
        validateRPE(targetRPE, targetRPEInput);
      });
    });

    const actualRPEInputs = document.querySelectorAll(
      '.actualRPE'
    ) as NodeListOf<HTMLInputElement>;
    actualRPEInputs.forEach((input) => {
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        let rpe = target.value;

        if (rpe === '') {
          target.value = '';
          target.dispatchEvent(changeEvent);
          return;
        }

        rpe = rpe.replace(/,/g, '.'); //replace commas with dots
        let numbers = rpe.split(';').map(Number);

        if (numbers.length === 1 && !isNaN(numbers[0])) {
          //rpe is valid (number) and inputted without further values separated by ;
          validateRPE(numbers[0], target);

          // finde das zugehörige planedRPE und workoutNotes element
          const parentRow = target.closest('tr')!;
          const planedRPE = parentRow.querySelector(
            '.targetRPE'
          )! as HTMLInputElement;
          const workoutNotes = parentRow.querySelector(
            '.workout-notes'
          ) as HTMLInputElement;

          const rpeDiff = parseFloat(planedRPE.value) - numbers[0];
          return;
        }

        if (numbers.some(isNaN)) {
          //if one of the values is not a number
          target.value = '';
          target.dispatchEvent(changeEvent);
          return;
        }

        const parentRow = target.closest('tr')!;
        const setInputs = parentRow.querySelector('.sets') as HTMLInputElement;

        if (numbers.length == parseInt(setInputs.value)) {
          const sum = numbers.reduce((acc, num) => acc + num, 0);
          const average = sum / numbers.length;

          const roundedAverage = Math.ceil(average / 0.5) * 0.5;
          const planedRPE = parentRow.querySelector(
            '.targetRPE'
          ) as HTMLInputElement;
          const workoutNotes = parentRow.querySelector(
            '.workout-notes'
          ) as HTMLInputElement;

          const rpeDiff = parseFloat(planedRPE.value) - roundedAverage;
          validateRPE(roundedAverage, target);
        }
      });
    });
  }
}
