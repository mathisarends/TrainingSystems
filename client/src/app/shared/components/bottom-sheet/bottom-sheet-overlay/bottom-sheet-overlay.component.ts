import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-bottom-sheet-overlay',
  standalone: true,
  template: '',
  styleUrl: './bottom-sheet-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheetOverlayComponent implements OnInit, OnDestroy {
  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.renderer.addClass(document.body, 'gray-filter');
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'gray-filter');
  }
}
