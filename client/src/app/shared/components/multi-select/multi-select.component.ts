import {
  ChangeDetectionStrategy,
  Component,
  effect,
  HostListener,
  Injector,
  input,
  model,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toggleCollapseAnimation } from '../../animations/toggle-collapse';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';
import { CheckboxItem } from '../checbkox/checkbox-item';
import { CheckboxComponent } from '../checbkox/checkbox.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';

/**
 * Represents a generic multi-select-dropdown
 */
@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [FormsModule, IconComponent, SearchBarComponent, CheckboxComponent],
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  animations: [toggleCollapseAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  selectedItems = model.required<string[]>();

  /**
   * A signal representing the open/closed state of the dropdown.
   */
  isOpen = signal(false);

  /**
   * The current search term entered by the user for filtering options.
   */
  searchQuery = signal('');

  /**
   * A signal representing the filtered items based on the search term.
   */
  filteredItems = signal<string[]>([]);

  constructor(private injector: Injector) {}

  ngOnInit(): void {
    this.filteredItems.set(this.items());

    effect(
      () => {
        const filtered = this.items().filter((option) =>
          option.toLowerCase().includes(this.searchQuery().toLowerCase()),
        );
        this.filteredItems.set(filtered);
      },
      { injector: this.injector, allowSignalWrites: true },
    );
  }

  toggleDropdown() {
    this.isOpen.set(!this.isOpen());
  }

  /**
   * Handles changes to the selection state when an option is selected or deselected.
   * Updates the selected signal and emits the selectionChange event.
   * @param option The option that was selected or deselected.
   * @param event The DOM event triggered by the selection change.
   */
  onSelectionChange(option: string, checkboxItem: CheckboxItem): void {
    const newSelected = [...this.selectedItems()];
    if (checkboxItem.isChecked) {
      newSelected.push(option);
    } else {
      const index = newSelected.indexOf(option);
      if (index > -1) {
        newSelected.splice(index, 1);
      }
    }

    this.selectedItems.set(newSelected);
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
