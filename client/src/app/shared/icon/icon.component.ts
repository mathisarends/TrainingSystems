import { Component, HostListener, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconName } from './icon-name';

/**
 * Renders an SVG icon.
 * The icon can be customized with different sizes, colors, and fill options.
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.component.html',
})
export class IconComponent {
  /**
   * Exposes the `IconName` enum to the template for type-safe access to icon names.
   *
   * @protected
   */
  protected readonly IconName = IconName;

  /**
   * The name of the icon to display.
   * This input is required and must match one of the values in the `IconName` enum.
   */
  name = input.required<string>();

  /**
   * The size of the icon in pixels.
   * This input is optional and defaults to `18` if not provided.
   */
  size = input<number>(18);

  /**
   * The color of the icon's stroke and fill.
   * This input is optional and defaults to `'currentColor'` if not provided.
   */
  color = input<string>('currentColor');

  /**
   * Determines whether the icon should be filled with the specified color.
   * This input is optional and defaults to `false` if not provided.
   */
  fillIcon = input<boolean>(false);

  /**
   * Emits an event when the icon is clicked.
   * This output can be used to trigger actions when the user interacts with the icon.
   */
  clicked = output<void>();

  /**
   * HostListener for the `click` event.
   * Triggers the `clicked` output when the icon is clicked by the user.
   */
  @HostListener('click')
  onClick() {
    this.clicked.emit();
  }
}
