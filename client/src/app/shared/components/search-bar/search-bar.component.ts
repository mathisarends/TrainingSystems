import { CommonModule } from '@angular/common';
import { Component, output } from '@angular/core';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
  protected readonly IconName = IconName;

  searchQueryChanged = output<string>();

  constructor() {}

  // Called when the user types in the search input
  onInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQueryChanged.emit(target.value);
  }
}
