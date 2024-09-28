import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  HostListener,
  Injector,
  input,
  model,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { toggleCollapseAnimation } from '../../animations/toggle-collapse';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';
import { KeyboardService } from '../../service/keyboard.service';
import { CheckboxItem } from '../checbkox/checkbox-item';
import { CheckboxComponent } from '../checbkox/checkbox.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';

/**
 * Represents a generic multi-select-dropdown
 */
@Component({
  selector: 'app-select',
  standalone: true,
  imports: [FormsModule, IconComponent, SearchBarComponent, CheckboxComponent],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  animations: [toggleCollapseAnimation],
  providers: [KeyboardService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent implements OnInit {
  @ViewChild(SearchBarComponent) searchBar!: SearchBarComponent;
  protected IconName = IconName;

  /**
   * The list of options available for selection.
   * This input is required and must be provided by the parent component.
   */
  options = input.required<string[]>();

  /**
   * The list of currently selected options.
   * This input is optional and can be initialized with a predefined selection.
   */
  selectedOptions = model.required<string[]>();

  /**
   * Determines wheter the select shall be toggled after an item was selected.
   */
  toggleOnSelect = input<boolean>(false);

  /**
   * Determines wheter mulitple items can be selected.
   */
  selectionMode = input<'single' | 'multiple'>('multiple');

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

  constructor(
    private injector: Injector,
    private destroyRef: DestroyRef,
    private keyboardService: KeyboardService,
  ) {}

  /**
   * Initializes the component by setting up keyboard event listeners,
   * the filtering logic, and handling changes to the selection mode.
   */
  ngOnInit(): void {
    this.setupKeyboardEventListeners();

    this.setupFilterLogic();

    this.setupSelectionModeChanged();
  }

  /**
   * Toggles the dropdown open or closed when the component is clicked.
   * Focuses the search bar input when the dropdown is opened.
   */
  @HostListener('click')
  toggleOptionsContainer(): void {
    this.isOpen.set(!this.isOpen());

    if (this.isOpen()) {
      this.searchBar.focusInput();
    }
  }

  /**
   * Closes the dropdown if a click occurs outside of the component.
   * This method is decorated with @HostListener to listen to global click events.
   * @param event The DOM event triggered by the document click.
   */
  @HostListener('document:click', ['$event'])
  closeOptionsContainer(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.isOpen() && !target.closest('app-select')) {
      this.isOpen.set(false);
    }
  }

  /**
   * Handles changes to the selection state when an option is selected or deselected.
   * Updates the `selectedItems` signal accordingly.
   *
   * If in single-selection mode, it selects only one item at a time and closes the dropdown.
   * In multi-selection mode, it adds or removes items from the selection based on checkbox state..
   */
  protected onSelectionChange(option: string, checkboxItem: CheckboxItem): void {
    if (this.isSingleSelectionModeActive()) {
      this.selectedOptions.set([option]);
      this.isOpen.set(false);
      return;
    }

    const newSelected = checkboxItem.isChecked
      ? [...this.selectedOptions(), option]
      : this.selectedOptions().filter((item) => item !== option);

    this.selectedOptions.set(newSelected);

    if (this.toggleOnSelect()) {
      this.isOpen.set(false);
    }
  }

  /**
   * Sets up the event listeners for keyboard interactions.
   * Closes the dropdown and clears the search query when the escape key is pressed.
   */
  private setupKeyboardEventListeners(): void {
    this.keyboardService
      .escapePressed$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.searchQuery.set('');
        this.isOpen.set(false);
      });
  }

  /**
   * Sets up the logic to filter the items based on the search query.
   * This effect runs whenever the search query or item list changes.
   */
  private setupFilterLogic(): void {
    this.filteredItems.set(this.options());

    effect(
      () => {
        const filtered = this.options().filter((option) =>
          option.toLowerCase().includes(this.searchQuery().toLowerCase()),
        );
        this.filteredItems.set(filtered);
      },
      { injector: this.injector, allowSignalWrites: true },
    );
  }

  /**
   * Sets up the logic to handle changes in the selection mode (single/multiple).
   * If the mode is changed to single-selection, the first item is automatically selected.
   */
  private setupSelectionModeChanged(): void {
    effect(
      () => {
        if (this.isSingleSelectionModeActive()) {
          const firstItem = this.selectedOptions()[0];
          this.selectedOptions.set([firstItem]);
        }
      },
      { injector: this.injector, allowSignalWrites: true },
    );
  }

  /**
   * Determines if the component is in single-selection mode.
   */
  private isSingleSelectionModeActive(): boolean {
    return this.selectionMode() === 'single';
  }
}
