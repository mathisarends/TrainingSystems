import { Component, DestroyRef, HostListener, input, model, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toggleCollapseAnimation } from '../../animations/toggle-collapse';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';
import { KeyboardService } from '../../service/keyboard.service';
import { CheckboxComponent } from '../checbkox/checkbox.component';

@Component({
  standalone: true,
  imports: [IconComponent, CheckboxComponent],
  selector: 'app-single-select',
  templateUrl: './single-select.component.html',
  styleUrls: ['./single-select.component.scss'],
  animations: [toggleCollapseAnimation],
  providers: [KeyboardService],
})
export class SingleSelectComponent implements OnInit {
  protected readonly IconName = IconName;

  value = model.required<string>();

  /**
   * The list of options available for selection.
   * This input is required and must be provided by the parent component.
   */
  options = input.required<string[]>();

  /**
   * A signal representing the open/closed state of the dropdown.
   */
  isOpen = signal(false);

  constructor(
    private destroyRef: DestroyRef,
    private keyboardService: KeyboardService,
  ) {}

  /**
   * Initializes the component and sets up keyboard handling for the escape key.
   */
  ngOnInit(): void {
    this.setupKeyboardService();
  }

  /**
   * Handles the selection of an option.
   */
  protected onSelectionChange(newValue: string) {
    this.value.set(newValue);
    this.isOpen.set(false);
  }

  /**
   * Toggles the visibility of the dropdown options.
   * This method is triggered by a click on the component.
   */
  @HostListener('click')
  toggleOptions(): void {
    this.isOpen.set(!this.isOpen());
  }

  /**
   * Closes the dropdown if a click occurs outside of the component.
   * This method is decorated with @HostListener to listen to global click events.
   */
  @HostListener('document:click', ['$event'])
  collapseDropdownIfExpanded(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.isOpen() && !target.closest('app-single-select')) {
      this.isOpen.set(false);
    }
  }

  /**
   * Sets up the keyboard service to close the dropdown when the escape key is pressed.
   * This method subscribes to the `escapePressed$` observable and updates the dropdown state accordingly.
   */
  private setupKeyboardService(): void {
    this.keyboardService
      .escapePressed$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.isOpen.set(false);
      });
  }
}
