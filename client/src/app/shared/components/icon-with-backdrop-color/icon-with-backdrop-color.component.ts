import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';
import { IconBackgroundColor } from '../icon-list-item/icon-background-color';

@Component({
  selector: 'app-icon-with-backdrop-color',
  templateUrl: './icon-with-backdrop-color.component.html',
  styleUrls: ['./icon-with-backdrop-color.component.scss'],
  standalone: true,
  imports: [IconComponent, CommonModule],
})
export class IconWithBackdropColorComponent {
  icon = input.required<IconName>();
  iconColor = input.required<IconBackgroundColor>();
  iconBackgroundColor = computed(() => this.setOpacity(this.iconColor(), 0.2));

  private setOpacity(hex: string, opacity: number): string {
    const num = parseInt(hex.slice(1), 16);
    const r = (num >> 16) & 0xff;
    const g = (num >> 8) & 0xff;
    const b = num & 0xff;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
}
