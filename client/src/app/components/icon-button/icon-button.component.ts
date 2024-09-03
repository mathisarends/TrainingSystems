import { Component, input, output } from '@angular/core';
import { TooltipDirective } from '../../../service/tooltip/tooltip.directive';
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
  tooltipTitle = input<string>('');
  iconName = input.required<IconName>();

  buttonClick = output<void>();

  onClick() {
    this.buttonClick.emit();
  }
}
