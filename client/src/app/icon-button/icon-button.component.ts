import { Component, EventEmitter, input, Output } from '@angular/core';
import { TooltipDirective } from '../../service/tooltip/tooltip.directive';
@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [TooltipDirective],
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
