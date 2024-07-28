import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AutoSaveService {
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  initializeAutoSave() {
    const weightInputs = document.querySelectorAll(
      '.weight'
    ) as NodeListOf<HTMLInputElement>;
    const form = document.getElementById('form') as HTMLFormElement;

    weightInputs.forEach((weightInput) => {
      this.renderer.listen(weightInput, 'change', (e) => {
        form.dispatchEvent(new Event('submit'));
      });
    });
  }
}
