import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';
import { IconBackgroundColor } from '../icon-list-item/icon-background-color';
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
  protected readonly IconBackgroundColor = IconBackgroundColor;

  icon = input.required<IconName>();
  iconBackgroundColor = input.required<IconBackgroundColor>();
  unit = input.required<string>();
  differenceFromLastSession = input.required<number>();
  title = input.required<string>();
  isPositiveTrend = computed(() => this.differenceFromLastSession() > 0);
  explanationText = input.required<string>();
}
