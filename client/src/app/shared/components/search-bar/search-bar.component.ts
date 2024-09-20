import { CommonModule } from '@angular/common';
import { Component, output, signal, WritableSignal } from '@angular/core';
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

  /**
   * A WritableSignal that holds the current search query string.
   */
  protected searchQuery: WritableSignal<string> = signal('');

  /**
   * An output event that emits the current search query string whenever it changes.
   */
  searchQueryChanged = output<string>();

  constructor() {}

  /**
   * Handles user input changes within the search bar.
   *
   * @param event The input change event object.
   */
  onInputChange(event: Event) {
    const target = event.target as HTMLInputElement;

    this.searchQuery.set(target.value);
    this.searchQueryChanged.emit(target.value);
  }

  /**
   * Clears the current search query.
   */
  clearSearch() {
    this.searchQuery.set('');
    this.searchQueryChanged.emit('');
  }
}
