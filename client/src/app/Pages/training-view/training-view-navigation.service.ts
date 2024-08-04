import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TrainingPlanDto } from './trainingPlanDto';
import { FormService } from '../../../service/form/form.service';

@Injectable({
  providedIn: 'root',
})
export class TrainingViewNavigationService {
  constructor(private router: Router, private formService: FormService) {}

  navigateDay(
    trainingDayIndex: number,
    trainingFrequency: number,
    week: number
  ): number {
    if (trainingDayIndex >= 0 && trainingDayIndex <= trainingFrequency - 1) {
      trainingDayIndex = trainingDayIndex;

      this.router.navigate([], {
        queryParams: {
          week: week,
          day: trainingDayIndex,
        },
        queryParamsHandling: 'merge',
      });
    }

    this.clearInputValues();

    return trainingDayIndex;
  }

  /** Per Default auf den ersten Tag der Woche navigieren */
  navigateWeek(
    trainingWeekIndex: number,
    direction: number,
    trainingPlanData: TrainingPlanDto,
    day = 0
  ): number {
    let week = 0;

    if (trainingWeekIndex === 0 && direction === -1) {
      week = trainingPlanData.trainingBlockLength - 1;
    } else if (
      trainingWeekIndex === trainingPlanData.trainingBlockLength - 1 &&
      direction === 1
    ) {
      week = 0;
    } else {
      week = trainingWeekIndex + direction;
    }

    this.router.navigate([], {
      queryParams: {
        week: week,
        day: day,
      },
      queryParamsHandling: 'merge',
    });

    this.clearInputValues();

    return week;
  }

  private clearInputValues() {
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
}
