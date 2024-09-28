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
  items = input.required<string[]>();

  /**
   * The list of currently selected items.
   * This input is optional and can be initialized with a predefined selection.
   */
  selectedItems = model.required<string[]>();

  /**
   * Determines wheter the select shall be toggled after an item was selected.
   */
  toggleOnSelect = input<boolean>(false);

  /**
   * Determines wheter mulitple items can be selected.
   */
  isSingleSelect = input<boolean>(false);

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

  ngOnInit(): void {
    this.filteredItems.set(this.items());

    this.keyboardService
      .escapePressed$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.searchQuery.set('');
        this.isOpen.set(false);
      });

    effect(
      () => {
        if (this.isSingleSelect()) {
          const firstItem = this.items()[0];
          this.selectedItems.set([firstItem]);
        }
        const filtered = this.items().filter((option) =>
          option.toLowerCase().includes(this.searchQuery().toLowerCase()),
        );
        this.filteredItems.set(filtered);
      },
      { injector: this.injector, allowSignalWrites: true },
    );
  }

  /**
   * Handles changes to the selection state when an option is selected or deselected.
   * Updates the selected signal and emits the selectionChange event.
   * @param option The option that was selected or deselected.
   * @param event The DOM event triggered by the selection change.
   */
  onSelectionChange(option: string, checkboxItem: CheckboxItem): void {
    if (this.isSingleSelect()) {
      this.selectedItems.set([option]);
      this.isOpen.set(false);
      return;
    }

    const newSelected = checkboxItem.isChecked
      ? [...this.selectedItems(), option]
      : this.selectedItems().filter((item) => item !== option);

    this.selectedItems.set(newSelected);

    if (this.toggleOnSelect()) {
      this.isOpen.set(false);
    }
  }

  @HostListener('click')
  onHostClick(): void {
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
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.isOpen() && !target.closest('app-select')) {
      this.isOpen.set(false);
    }
  }
}
