import { Component, EventEmitter, input, Output } from '@angular/core';
import { TooltipDirective } from '../../service/tooltip/tooltip.directive';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [TooltipDirective, CommonModule],
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
})
export class IconButtonComponent {
  tooltipTitle = input<string>('');
  iconClass = input.required<string>();
  @Output() buttonClick = new EventEmitter<void>();

  onClick() {
    this.buttonClick.emit();
  }
}
