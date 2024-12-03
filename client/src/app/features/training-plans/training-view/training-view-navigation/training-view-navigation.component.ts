import { Component, input } from '@angular/core';
import { NavigationArrowsComponent } from '../../../../shared/components/navigation-arrows/navigation-arrows.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { IconName } from '../../../../shared/icon/icon-name';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { NavigationDirection } from '../models/navigation-direction.enum';
import { TrainingPlanDataService } from '../services/training-plan-data.service';
import { TrainingViewNavigationService } from '../training-view-navigation.service';

@Component({
  selector: 'app-training-view-navigation',
  standalone: true,
  imports: [IconComponent, PaginationComponent, NavigationArrowsComponent],
  templateUrl: './training-view-navigation.component.html',
  styleUrls: ['./training-view-navigation.component.scss'],
})
export class TrainingViewNavigationComponent {
  protected readonly IconName = IconName;
  protected readonly NavigationDirection = NavigationDirection;

  trainingDayIndex = input.required<number>();
  trainingWeekIndex = input.required<number>();

  constructor(
    protected trainingDataService: TrainingPlanDataService,
    protected navigationService: TrainingViewNavigationService,
  ) {}
}
