import { Component, signal } from '@angular/core';
import { IconComponent } from '../shared/icon/icon.component';
import { IconName } from '../shared/icon/icon-name';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [IconComponent], // Ensure you add your Icon component here
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent {
  protected readonly IconName = IconName;

  options = signal(['Option 1', 'Option 2', 'Option 3']);
  selectedOption = signal('');
  isDropdownOpen = signal(false);

  selectOption(option: string) {
    this.selectedOption.set(option);
    this.toggleDropdown(); // Close dropdown after selection
  }

  toggleDropdown() {
    console.log('toggle');
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }
}
