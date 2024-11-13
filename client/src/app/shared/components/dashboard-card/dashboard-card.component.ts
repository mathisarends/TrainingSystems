import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';
import { IconWithBackdropColorComponent } from '../icon-with-backdrop-color/icon-with-backdrop-color.component';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [CommonModule, IconComponent, IconWithBackdropColorComponent],
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.scss'],
})
export class DashboardCardComponent {
  protected readonly IconName = IconName;

  title = input.required<string>();
  icon = input.required<IconName>();
  unit = input.required<number>();
  differenceFromLastSession = input.required<number>();
  isPositiveTrend = computed(() => this.differenceFromLastSession() > 0);
}
