import { Component, HostListener, input, output } from '@angular/core';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';

@Component({
  selector: 'app-circular-icon-button',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './circular-icon-button.component.html',
  styleUrl: './circular-icon-button.component.scss',
})
export class CircularIconButtonComponent {
  icon = input.required<IconName>();

  iconSize = input<number>(20);

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
