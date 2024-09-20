import { Component, signal, WritableSignal } from '@angular/core';
import { toggleCollapseAnimation } from '../../animations/toggle-collapse';
import { IconName } from '../../icon/icon-name';
import { CircularIconButtonComponent } from '../circular-icon-button/circular-icon-button.component';

@Component({
  selector: 'app-more-options-button',
  standalone: true,
  imports: [CircularIconButtonComponent],
  templateUrl: './more-options-button.component.html',
  styleUrls: ['./more-options-button.component.scss'],
  animations: [toggleCollapseAnimation],
})
export class MoreOptionsButtonComponent {
  protected readonly IconName = IconName;

  isDropdownOpen: WritableSignal<boolean> = signal(false);

  toggleDropdown() {
    this.isDropdownOpen.update((current) => !current);
  }

  selectOption(option: string) {
    console.log(`Selected: ${option}`);
    this.isDropdownOpen.set(false);
  }
}
