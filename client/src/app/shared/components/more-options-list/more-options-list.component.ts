import { Component, HostBinding, input, model } from '@angular/core';
import { toggleCollapseAnimation } from '../../animations/toggle-collapse';
import { IconComponent } from '../../icon/icon.component';
import { MoreOptionListItem } from '../more-options-button/more-option-list-item';

@Component({
  standalone: true,
  imports: [IconComponent],
  selector: 'app-more-options-list',
  templateUrl: 'more-options-list.component.html',
  styleUrls: ['./more-options-list.component.scss'],
  animations: [toggleCollapseAnimation],
})
export class MoreOptionsList {
  options = input.required<MoreOptionListItem[]>();

  isCollapsed = model.required<boolean>();

  position = input<'bottom' | 'left' | 'top'>('bottom');

  @HostBinding('class') get hostClasses(): string {
    return this.position();
  }

  /**
   * Emits the selected option and collapses the dropdown menu.
   *
   * @param option The selected option from the dropdown.
   */
  protected selectOption(option: MoreOptionListItem, event: Event) {
    event.stopPropagation();
    this.isCollapsed.set(true);
    option.callback();
  }

  @HostBinding('@toggleCollapse') get toggleAnimation() {
    return this.isCollapsed() ? 'collapsed' : 'expanded';
  }
}
