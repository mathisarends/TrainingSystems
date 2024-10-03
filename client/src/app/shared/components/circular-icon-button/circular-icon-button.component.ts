import { Component, input } from '@angular/core';
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

  /**
   * Determines the size of the icon displayed in the componenet.
   */
  iconSize = input<number>(20);
}
