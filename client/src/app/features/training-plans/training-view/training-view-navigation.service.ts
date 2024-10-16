import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TrainingPlanDto } from './trainingPlanDto';

@Injectable({
  providedIn: 'root',
})
export class TrainingViewNavigationService {
  constructor(private router: Router) {}

  navigateDay(trainingDayIndex: number, trainingFrequency: number, week: number): void {
    if (trainingDayIndex >= 0 && trainingDayIndex <= trainingFrequency - 1) {
      this.router.navigate([], {
        queryParams: {
          week: week,
          day: trainingDayIndex,
        },
        queryParamsHandling: 'merge',
      });
    }
  }

  /** Per Default auf den ersten Tag der Woche navigieren */
  navigateWeek(trainingWeekIndex: number, direction: number, trainingPlanData: TrainingPlanDto, day = 0): void {
    let week = 0;

    if (trainingWeekIndex === 0 && direction === -1) {
      week = trainingPlanData.trainingBlockLength - 1;
    } else if (trainingWeekIndex === trainingPlanData.trainingBlockLength - 1 && direction === 1) {
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
  }
}
