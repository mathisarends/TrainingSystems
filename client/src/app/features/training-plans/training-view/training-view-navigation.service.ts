import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationDirection } from './models/navigation-direction.enum';
import { TrainingPlanDataService } from './services/training-plan-data.service';

@Injectable()
export class TrainingViewNavigationService {
  constructor(
    private router: Router,
    private trainingDataService: TrainingPlanDataService,
  ) {}

  navigateToDay(week: number, day: number): void {
    this.router.navigate([], {
      queryParams: { week, day },
      queryParamsHandling: 'merge',
    });
  }

  navigateToWeek(navigationDirection: NavigationDirection, currentWeekIndex: number, day: number): void {
    let targetWeek: number;

    if (navigationDirection === NavigationDirection.FORWARD) {
      targetWeek = currentWeekIndex === this.trainingDataService.trainingBlockLength - 1 ? 0 : currentWeekIndex + 1;
    } else {
      targetWeek = currentWeekIndex === 0 ? this.trainingDataService.trainingBlockLength - 1 : currentWeekIndex - 1;
    }

    this.navigateToDay(targetWeek, day);
  }

  navigateToNextDay(trainingDayIndex: number, trainingWeekIndex: number): void {
    const nextDay = trainingDayIndex + 1;

    const isEndOfWeek = nextDay >= this.trainingDataService.trainingFrequency;
    const nextWeek = isEndOfWeek
      ? (trainingWeekIndex + 1) % this.trainingDataService.trainingBlockLength
      : trainingWeekIndex;
    const day = isEndOfWeek ? 0 : nextDay;

    this.navigateToDay(nextWeek, day);
  }

  navigateToPreviousDay(trainingDayIndex: number, trainingWeekIndex: number): void {
    const previousDay = trainingDayIndex - 1;

    const isStartOfWeek = previousDay < 0;

    let previousWeek: number;
    if (isStartOfWeek) {
      if (trainingWeekIndex === 0) {
        previousWeek = this.trainingDataService.trainingBlockLength - 1;
      } else {
        previousWeek = trainingWeekIndex - 1;
      }
    } else {
      previousWeek = trainingWeekIndex;
    }

    const day = isStartOfWeek ? this.trainingDataService.trainingFrequency - 1 : previousDay;

    this.navigateToDay(previousWeek, day);
  }
}
