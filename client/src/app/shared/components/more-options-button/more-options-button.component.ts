import { Component, ElementRef, HostListener, input, output, signal, WritableSignal } from '@angular/core';
import { toggleCollapseAnimation } from '../../animations/toggle-collapse';
import { IconName } from '../../icon/icon-name';
import { CircularIconButtonComponent } from '../circular-icon-button/circular-icon-button.component';

/**
 * Component that renders a circular icon button with a dropdown menu of options.
 */
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

  /**
   * The list of string options to be displayed in the dropdown menu.
   */
  options = input.required<string[]>();

  /**
   * Event emitter that outputs the selected option.
   */
  optionSelected = output<string>();

  /**
   * Signal to track whether the dropdown is collapsed or expanded.
   */
  isCollapsed: WritableSignal<boolean> = signal(true);

  /**
   * Creates an instance of MoreOptionsButtonComponent.
   *
   * @param elementRef Reference to the host DOM element, used to detect clicks outside the component.
   */
  constructor(private elementRef: ElementRef) {}

  /**
   * Toggles the collapsed state of the dropdown menu.
   * If the dropdown is collapsed, it will expand, and vice versa.
   */
  protected toggleCollapsed() {
    this.isCollapsed.update((current) => !current);
  }

  /**
   * Emits the selected option and collapses the dropdown menu.
   *
   * @param option The selected option from the dropdown.
   */
  protected selectOption(option: string) {
    this.isCollapsed.set(true);
    this.optionSelected.emit(option);
  }

  /**
   * Host listener for the document's click event.
   * Collapses the dropdown menu when a click is detected outside of the component.
   *
   * @param event The click event on the document.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (this.isCollapsed() === false && !this.elementRef.nativeElement.contains(target)) {
      this.isCollapsed.set(true);
    }
  }
}