import { DestroyRef, Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { RouteWatcherService } from '../service/route-watcher.service';

/**
 * Directive to display a tooltip with a message when an element is hovered over.
 */
@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective {
  @Input('appTooltip') tooltipMessage: string = '';
  tooltipElement!: HTMLElement;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private destroyRef: DestroyRef,
    private routeWatcherService: RouteWatcherService,
  ) {
    this.destroyRef.onDestroy(() => {
      if (this.tooltipElement) {
        this.renderer.removeChild(document.body, this.tooltipElement);
      }
    });
  }

  /**
   * Event listener for mouseenter event.
   * Creates and displays the tooltip element.
   */
  /**
   * Event listener for mouseenter event.
   * Creates and displays the tooltip element.
   */
  @HostListener('mouseenter') onMouseEnter() {
    if (!this.tooltipMessage) return; // Do nothing if tooltip message is empty

    if (!this.tooltipElement) {
      this.createTooltipElement();
    }
    this.showTooltip();
  }

  /**
   * Event listener for mouseleave event.
   * Hides the tooltip element.
   */
  @HostListener('mouseleave') onMouseLeave() {
    this.hideTooltip();
  }

  /**
   * Creates the tooltip element and appends it to the body.
   */
  private createTooltipElement() {
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'tooltip-container');

    const text = this.renderer.createElement('span');
    this.renderer.addClass(text, 'tooltip-text');
    this.renderer.appendChild(text, this.renderer.createText(this.tooltipMessage));
    this.renderer.appendChild(this.tooltipElement, text);

    this.renderer.appendChild(document.body, this.tooltipElement);
  }

  /**
   * Shows the tooltip element by setting its position and visibility.
   */
  private showTooltip() {
    if (!this.tooltipElement) return;

    const rect = this.el.nativeElement.getBoundingClientRect();
    this.renderer.setStyle(
      this.tooltipElement,
      'top',
      `${rect.top + window.scrollY - this.tooltipElement.offsetHeight - 7.5}px`,
    );
    this.renderer.setStyle(
      this.tooltipElement,
      'left',
      `${rect.left + window.scrollX + rect.width / 2 - this.tooltipElement.offsetWidth / 2}px`,
    );
    this.renderer.setStyle(this.tooltipElement, 'visibility', 'visible');
    this.renderer.setStyle(this.tooltipElement, 'opacity', '1');
  }

  /**
   * Hides the tooltip element.
   */
  private hideTooltip() {
    if (this.tooltipElement) {
      this.renderer.setStyle(this.tooltipElement, 'visibility', 'hidden');
      this.renderer.setStyle(this.tooltipElement, 'opacity', '0');
    }
  }
}
