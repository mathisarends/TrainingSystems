import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
@Component({
  selector: 'app-modal-overlay',
  standalone: true,
  imports: [],
  templateUrl: './modal-overlay.component.html',
  styleUrl: './modal-overlay.component.scss',
})
export class ModalOverlayComponent {
  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.renderer.addClass(document.body, 'blur-background');
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'blur-background');
  }
}
