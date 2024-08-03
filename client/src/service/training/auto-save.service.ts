import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AutoSaveService {
  private renderer: Renderer2;
  private listeners: (() => void)[] = []; // Array zum Speichern der Listener

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  initializeAutoSave() {
    // Event Listener entfernen, wenn sie existieren
    this.clearEventListeners();

    const weightInputs = document.querySelectorAll(
      '.weight'
    ) as NodeListOf<HTMLInputElement>;

    const form = document.getElementById('form') as HTMLFormElement;

    weightInputs.forEach((weightInput) => {
      const listener = this.renderer.listen(weightInput, 'change', (e) => {
        form.dispatchEvent(new Event('submit'));
      });
      this.listeners.push(listener); // Listener speichern
    });
  }

  // Methode zum Entfernen von Event Listenern
  clearEventListeners() {
    this.listeners.forEach((unlisten) => unlisten()); // Listener entfernen
    this.listeners = []; // Array leeren
  }
}
