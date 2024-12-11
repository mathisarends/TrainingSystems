import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-modal-overlay',
  standalone: true,
  imports: [],
  template: '',
  styleUrl: './bottom-sheet-overlay.component.scss',
})
export class BottomSheetOverlayComponent implements OnInit, OnDestroy {
  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.renderer.addClass(document.body, 'blur-background');
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'blur-background');
  }
}
