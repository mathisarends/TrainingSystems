import { CommonModule } from '@angular/common';
import { Component, HostListener, input, output } from '@angular/core';
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

  /**
   * An event emitter that emits the current `IconListItem` when the component
   * is clicked.
   */
  itemClicked = output<string>();

  iconTilting = input(false);

  /**
   * Handles the click event on the component. When the user clicks anywhere
   * on the component, this method is triggered, emitting the `itemClicked` event
   * with the current `IconListItem`.
   */
  @HostListener('click')
  onClick() {
    this.itemClicked.emit(this.label());
  }
}
