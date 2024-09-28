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
import { ToCheckboxItemPipe } from '../checbkox/to-checkbox-iten.pipe';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { SelectOption, SelectOptionItem } from './select-option-item';

/**
 * Represents a generic select component that can handle both simple strings
 * and complex objects (SelectOptionItem) as options.
 */
@Component({
  selector: 'app-select',
  standalone: true,
  imports: [FormsModule, IconComponent, SearchBarComponent, CheckboxComponent, ToCheckboxItemPipe],
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
   * This can be either an array of strings or complex SelectOptionItem objects.
   */
  options = input.required<SelectOption[]>();

  /**
   * The list of currently selected options.
   * This input is optional and can be initialized with a predefined selection.
   */
  selectedOptions = model.required<SelectOption[]>();

  /**
   * Determines whether the select shall be toggled after an item was selected.
   */
  toggleOnSelect = input<boolean>(false);

  /**
   * Determines whether multiple items can be selected.
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
  filteredItems = signal<SelectOption[]>([]);

  constructor(
    private injector: Injector,
    private destroyRef: DestroyRef,
    private keyboardService: KeyboardService,
  ) {}

  ngOnInit(): void {
    this.setupKeyboardEventListeners();
    this.setupFilterLogic();
    this.setupSelectionModeChanged();
  }

  @HostListener('click')
  toggleOptionsContainer(): void {
    this.isOpen.set(!this.isOpen());

    if (this.isOpen()) {
      this.searchBar.focusInput();
    }
  }

  @HostListener('document:click', ['$event'])
  closeOptionsContainer(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.isOpen() && !target.closest('app-select')) {
      this.isOpen.set(false);
    }
  }

  /**
   * Handles changes to the selection state when an option is selected or deselected.
   * The `option` can either be a string or a SelectOptionItem.
   *
   * For complex objects, the `id` is emitted, while for strings, the string itself is emitted.
   */
  protected onSelectionChange(option: string | SelectOptionItem, checkboxItem: CheckboxItem): void {
    const optionValue = this.isOptionObject(option) ? option.id : option;

    if (this.isSingleSelectionModeActive()) {
      this.selectedOptions.set([optionValue]);
      this.isOpen.set(false);
      return;
    }

    const newSelected = checkboxItem.isChecked
      ? [...this.selectedOptions(), optionValue]
      : this.selectedOptions().filter((item) => item !== optionValue);

    this.selectedOptions.set(newSelected);

    if (this.toggleOnSelect()) {
      this.isOpen.set(false);
    }
  }

  private setupKeyboardEventListeners(): void {
    this.keyboardService
      .escapePressed$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.searchQuery.set('');
        this.isOpen.set(false);
      });
  }

  private setupFilterLogic(): void {
    this.filteredItems.set(this.options());

    effect(
      () => {
        const filtered = this.options().filter((option) => {
          const label = this.isOptionObject(option) ? option.label : option;
          return label.toLowerCase().includes(this.searchQuery().toLowerCase());
        });
        this.filteredItems.set(filtered);
      },
      { injector: this.injector, allowSignalWrites: true },
    );
  }

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

  /**
   * Utility to check if the option is a `SelectOptionItem` object.
   */
  private isOptionObject(option: string | SelectOptionItem): option is SelectOptionItem {
    return typeof option === 'object' && 'id' in option && 'label' in option;
  }
}
