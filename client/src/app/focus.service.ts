import { Injectable } from '@angular/core';

@Injectable()
export class FocusService {
  private focusedElementId: string | null = null;

  saveFocusedElement() {
    const focusedElement = document.activeElement as HTMLElement;
    if (focusedElement && focusedElement.id) {
      this.focusedElementId = focusedElement.id;
      localStorage.setItem('focusedElementId', this.focusedElementId);
    }
  }

  restoreFocusedElement() {
    const storedId = localStorage.getItem('focusedElementId');
    if (storedId) {
      const elementToFocus = document.getElementById(storedId);
      if (elementToFocus) {
        elementToFocus.focus();
      }
    }
  }

  clearFocusedElement() {
    localStorage.removeItem('focusedElementId');
  }
}
