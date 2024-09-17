import { Component, HostListener, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';
import { MultiSelectSpinnerComponent } from './multi-select-spinner/multi-select-spinner.component';

/**
 * Represents a generic multi-select-dropdown
 */
@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [FormsModule, MultiSelectSpinnerComponent, IconComponent],
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
})
export class MultiSelectComponent implements OnInit {
  protected IconName = IconName;

  /**
   * The list of options available for selection.
   * This input is required and must be provided by the parent component.
   */
  items = input.required<string[]>();

  /**
   * The list of currently selected items.
   * This input is optional and can be initialized with a predefined selection.
   */
  selectedItems = input<string[]>([]);

  /**
   * Emits an event whenever the selection changes.
   * The emitted value is the updated list of selected items.
   */
  selectionChange = output<string[]>();

  /**
   * A signal representing the current selection state.
   * This is used internally to manage the selected items.
   */
  selected = signal<string[]>([]);

  /**
   * A signal representing the open/closed state of the dropdown.
   */
  isOpen = signal(false);

  /**
   * The current search term entered by the user for filtering options.
   */
  searchTerm = signal('');

  /**
   * A signal representing the filtered items based on the search term.
   */
  filteredItems = signal<string[]>([]);

  /**
   * Represents the loading state if the option have to be loaded from the backend.
   */
  isLoading = input<boolean>(false);

  ngOnInit(): void {
    this.selected.set(this.selectedItems());
    this.filteredItems.set(this.items());
  }

  toggleDropdown() {
    this.isOpen.set(!this.isOpen());
  }

  /**
   * Filters the available options based on the current search term.
   */
  filterOptions(): void {
    const filtered = this.items().filter((option) => option.toLowerCase().includes(this.searchTerm().toLowerCase()));
    this.filteredItems.set(filtered);
  }

  /**
   * Handles changes to the selection state when an option is selected or deselected.
   * Updates the selected signal and emits the selectionChange event.
   * @param option The option that was selected or deselected.
   * @param event The DOM event triggered by the selection change.
   */
  onSelectionChange(option: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const newSelected = [...this.selected()];
    if (inputElement.checked) {
      newSelected.push(option);
    } else {
      const index = newSelected.indexOf(option);
      if (index > -1) {
        newSelected.splice(index, 1);
      }
    }

    this.selected.set(newSelected);
    this.selectionChange.emit(newSelected);
  }

  /**
   * Closes the dropdown if a click occurs outside of the component.
   * This method is decorated with @HostListener to listen to global click events.
   * @param event The DOM event triggered by the document click.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.isOpen() && !target.closest('app-multi-select')) {
      this.isOpen.set(false);
    }
  }
}
