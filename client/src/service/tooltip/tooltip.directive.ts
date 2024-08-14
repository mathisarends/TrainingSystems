import { Directive, ElementRef, HostListener, Input, Renderer2, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

/**
 * Directive to display a tooltip with a message when an element is hovered over.
 */
@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') tooltipMessage: string = '';
  tooltipElement!: HTMLElement;
  private routerSubscription: Subscription;

  /**
   * Constructor to create an instance of TooltipDirective.
   * @param el - Reference to the element this directive is applied to.
   * @param renderer - Renderer2 instance to manipulate DOM elements.
   * @param router - Router instance to listen for route changes.
   */
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private router: Router,
  ) {
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.hideTooltip();
      });
  }

  /**
   * Event listener for mouseenter event.
   * Creates and displays the tooltip element.
   */
  @HostListener('mouseenter') onMouseEnter() {
    if (!this.tooltipElement) {
      this.tooltipElement = this.renderer.createElement('div');
      this.renderer.addClass(this.tooltipElement, 'tooltip-container');

      const arrow = this.renderer.createElement('div');
      this.renderer.addClass(arrow, 'tooltip-arrow');
      this.renderer.appendChild(this.tooltipElement, arrow);

      const text = this.renderer.createElement('span');
      this.renderer.addClass(text, 'tooltip-text');
      this.renderer.appendChild(text, this.renderer.createText(this.tooltipMessage));
      this.renderer.appendChild(this.tooltipElement, text);

      this.renderer.appendChild(document.body, this.tooltipElement);
    }
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
   * Event listener for mouseleave event.
   * Hides the tooltip element.
   */
  @HostListener('mouseleave') onMouseLeave() {
    this.hideTooltip();
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

  /**
   * Lifecycle hook that runs when the directive is destroyed.
   * Unsubscribes from the router events to avoid memory leaks.
   */
  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
    }
  }
}
