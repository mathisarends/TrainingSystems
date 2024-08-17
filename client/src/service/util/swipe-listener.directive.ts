import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { SwipeService } from '../swipe/swipe.service';

@Directive({
  selector: '[appSwipeListener]',
  standalone: true,
})
export class SwipeListenerDirective implements OnInit, OnChanges, OnDestroy {
  @Input() onSwipeLeft!: () => void;
  @Input() onSwipeRight!: () => void;
  @Input() onSwipeUp?: () => void;
  @Input() onSwipeDown?: () => void;

  constructor(
    private el: ElementRef,
    private swipeService: SwipeService,
  ) {}

  ngOnInit(): void {
    this.initializeListeners();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('🚀 ~ SwipeListenerDirective ~ ngOnChanges ~ changes:', changes);
    if (changes['onSwipeLeft'] || changes['onSwipeRight'] || changes['onSwipeUp'] || changes['onSwipeDown']) {
      this.initializeListeners();
    }
  }

  ngOnDestroy(): void {
    this.removeListeners();
  }

  private initializeListeners(): void {
    this.removeListeners(); // Entferne alte Listener, um sicherzustellen, dass keine doppelten Listener vorhanden sind
    this.swipeService.addSwipeListener(
      this.el.nativeElement,
      this.onSwipeLeft,
      this.onSwipeRight,
      this.onSwipeUp,
      this.onSwipeDown,
    );
  }

  private removeListeners(): void {
    this.swipeService.removeSwipeListener();
  }
}
