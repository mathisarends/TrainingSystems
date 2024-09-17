import { Component, HostListener, input, output } from '@angular/core';
import { TooltipDirective } from '../../shared/directives/tooltip.directive';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';
import { IconName } from '../../shared/icon/icon-name';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [TooltipDirective, CommonModule, IconComponent],
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
})
export class IconButtonComponent {
  /**
   * The name of the icon to be displayed inside the button.
   * This input is required.
   */
  iconName = input.required<IconName>();

  /**
   * The title to be displayed in the tooltip when hovering over the button.
   *
   */
  tooltipTitle = input<string>();

  /**
   * The Text that is optionally displayed next to the button.
   *
   */
  text = input<string>();

  /**
   * Event emitted when the button is clicked.
   */
  buttonClick = output<void>();

  @HostListener('click')
  onHostClick() {
    this.buttonClick.emit();
  }
}
