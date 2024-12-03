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
    let weekIndex = this.trainingDayLocatorService.trainingWeekIndex();

    if (day >= this.trainingDataService.trainingFrequency) {
      const isLastWeek = weekIndex === this.trainingDataService.trainingBlockLength - 1;

      weekIndex = isLastWeek ? 0 : weekIndex + 1;
      day = 0;
    } else if (day < 0) {
      day = this.trainingDataService.trainingFrequency - 1;
      weekIndex = weekIndex > 0 ? weekIndex - 1 : this.trainingDataService.trainingBlockLength - 1;
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
    let currentWeekIndex = this.trainingDayLocatorService.trainingWeekIndex();

    let targetWeek = currentWeekIndex;

    if (currentWeekIndex === 0 && navigationDirection === NavigationDirection.BACKWARD) {
      targetWeek = this.trainingDataService.trainingBlockLength - 1;
    } else if (
      currentWeekIndex === this.trainingDataService.trainingBlockLength - 1 &&
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
