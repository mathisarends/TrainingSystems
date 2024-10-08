import { Component, ElementRef, HostListener, input, output, signal, WritableSignal } from '@angular/core';
import { toggleCollapseAnimation } from '../../animations/toggle-collapse';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';
import { CircularIconButtonComponent } from '../circular-icon-button/circular-icon-button.component';
import { MoreOptionListItem } from './more-option-list-item';

/**
 * Component that renders a circular icon button with a dropdown menu of options.
 */
@Component({
  selector: 'app-more-options-button',
  standalone: true,
  imports: [CircularIconButtonComponent, IconComponent],
  templateUrl: './more-options-button.component.html',
  styleUrls: ['./more-options-button.component.scss'],
  animations: [toggleCollapseAnimation],
})
export class MoreOptionsButtonComponent {
  protected readonly IconName = IconName;

  /**
   * The list of string options to be displayed in the dropdown menu.
   */
  options = input.required<MoreOptionListItem[]>();

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
  protected selectOption(option: MoreOptionListItem, event: Event) {
    event.stopPropagation();
    this.isCollapsed.set(true);

    option.callback();
  }

  /**
   * Host listener for the document's click event.
   * Collapses the dropdown menu when a click is detected outside of the component.
   *
   * @param event The click event on the document.
   */
  @HostListener('document:click', ['$event'])
  @HostListener('document:touchstart', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (this.isCollapsed() === false && !this.elementRef.nativeElement.contains(target)) {
      this.isCollapsed.set(true);
    }
  }
}
