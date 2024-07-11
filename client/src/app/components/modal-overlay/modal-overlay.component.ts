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

  /**
   * Lifecycle hook that is called after the component has been initialized.
   * Adds a class to the document body to apply a blur effect to all content
   * that is not part of the modal, enhancing the focus on the modal content.
   */
  ngOnInit() {
    this.renderer.addClass(document.body, 'blur-background');
  }

  /**
   * Lifecycle hook that is called just before the component is destroyed.
   * Removes the class from the document body to remove the blur effect from
   * all content that is not part of the modal, restoring the original view.
   */
  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'blur-background');
  }
}
