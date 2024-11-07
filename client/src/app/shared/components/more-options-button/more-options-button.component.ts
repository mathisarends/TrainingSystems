import { Component, ElementRef, HostListener, input, signal } from '@angular/core';
import { toggleCollapseAnimation } from '../../animations/toggle-collapse';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';
import { CircularIconButtonComponent } from '../circular-icon-button/circular-icon-button.component';
import { MoreOptionsList } from '../more-options-list/more-options-list.component';
import { MoreOptionListItem } from './more-option-list-item';

/**
 * Component that renders a circular icon button with a dropdown menu of options.
 */
@Component({
  selector: 'app-more-options-button',
  standalone: true,
  imports: [CircularIconButtonComponent, IconComponent, MoreOptionsList],
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
   * Signal to track whether the dropdown is collapsed or expanded.
   */
  isCollapsed = signal(true);

  /**
   * Creates an instance of MoreOptionsButtonComponent.
   *
   * @param elementRef Reference to the host DOM element, used to detect clicks outside the component.
   */
  constructor(private elementRef: ElementRef) {}

  /**
   * Collapses the dropdown menu when no longer hovering over the component.
   */
  protected toggleCollapse() {
    this.isCollapsed.set(!this.isCollapsed());
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
