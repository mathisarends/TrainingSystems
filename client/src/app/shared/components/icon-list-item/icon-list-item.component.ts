import { CommonModule } from '@angular/common';
import { Component, HostListener, input } from '@angular/core';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';
import { IconBackgroundColor } from './icon-background-color';

@Component({
  standalone: true,
  imports: [IconComponent, CommonModule],
  selector: 'app-icon-list-item',
  templateUrl: './icon-list-item.component.html',
  styleUrl: './icon-list-item.component.scss',
})
export class IconListeItemComponent {
  protected readonly IconName = IconName;

  /**
   * The text label displayed alongside the icon.
   */
  label = input.required<string>();

  /**
   * The name of the icon to be displayed.
   */
  iconName = input.required<IconName>();

  /**
   * The background color of the icon.
   */
  iconBackgroundColor = input.required<IconBackgroundColor>();

  onItemClicked = input<() => void>();

  iconTilting = input(false);

  @HostListener('click')
  onClick() {
    const clickHandler = this.onItemClicked();
    if (clickHandler) {
      clickHandler();
    }
  }
}
