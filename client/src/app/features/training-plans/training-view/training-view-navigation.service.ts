import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationDirection } from './models/navigation-direction.enum';
import { TrainingDayLocatorService } from './services/training-day-locator.service';
import { TrainingPlanDataService } from './services/training-plan-data.service';

@Injectable()
export class TrainingViewNavigationService {
  constructor(
    private router: Router,
    private trainingDataService: TrainingPlanDataService,
    private trainingDayLocatorService: TrainingDayLocatorService,
  ) {}

  navigateDay(day: number): void {
    const trainingPlanData = this.trainingDataService.trainingPlanData;
    let weekIndex = this.trainingDayLocatorService.trainingWeekIndex;

    if (day >= trainingPlanData.trainingFrequency) {
      const isLastWeek = weekIndex === trainingPlanData.trainingBlockLength - 1;

      weekIndex = isLastWeek ? 0 : weekIndex + 1;
      day = 0;
    } else if (day < 0) {
      day = trainingPlanData.trainingFrequency - 1;
      weekIndex = weekIndex > 0 ? weekIndex - 1 : trainingPlanData.trainingBlockLength - 1;
    }

    this.router.navigate([], {
      queryParams: {
        week: weekIndex,
        day: day,
      },
      queryParamsHandling: 'merge',
    });
  }

  navigateWeek(navigationDirection: NavigationDirection, day: number): void {
    const trainingPlanData = this.trainingDataService.trainingPlanData;
    let currentWeekIndex = this.trainingDayLocatorService.trainingWeekIndex;

    if (!trainingPlanData) {
      console.warn('Training plan data not available.');
      return;
    }

    let targetWeek = currentWeekIndex;

    if (currentWeekIndex === 0 && navigationDirection === NavigationDirection.BACKWARD) {
      targetWeek = trainingPlanData.trainingBlockLength - 1;
    } else if (
      currentWeekIndex === trainingPlanData.trainingBlockLength - 1 &&
      navigationDirection === NavigationDirection.FORWARD
    ) {
      targetWeek = 0;
    } else {
      const direction = navigationDirection === NavigationDirection.FORWARD ? 1 : -1;
      targetWeek += direction;
    }

    this.router.navigate([], {
      queryParams: {
        week: targetWeek,
        day: day,
      },
      queryParamsHandling: 'merge',
    });
  }
}
