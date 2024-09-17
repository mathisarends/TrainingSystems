import { Injectable } from '@angular/core';

/**
 * Service to manage and restore the focus of an element in an Angular application.
 *
 * The `FocusService` is designed to save the currently focused element's ID when the application
 * is about to be hidden or closed, and restore the focus when the application becomes visible again.
 * This is particularly useful in Progressive Web Apps (PWA) and mobile environments where the user
 * might switch between apps or lock/unlock their device.
 */
@Injectable()
export class FocusService {
  private focusedElementId: string | null = null;

  private focusableElementClasses = ['weight', 'actualRPE', 'notes'];

  /**
   * Saves the ID of the currently focused element to local storage.
   *
   * This method retrieves the currently focused element from the `document.activeElement`,
   * checks if it has an ID, and then stores this ID in the `focusedElementId` property.
   * It also saves this ID to `localStorage` to persist the focus state across page reloads or tab switches.
   */
  saveFocusedElement() {
    const focusedElement = document.activeElement as HTMLElement;
    if (focusedElement?.id && this.hasFocusableClass(focusedElement)) {
      this.focusedElementId = focusedElement.id;
      localStorage.setItem('focusedElementId', this.focusedElementId);
    }
  }

  /**
   * Restores focus to the previously saved element, if possible.
   *
   * This method checks `localStorage` for a saved element ID. If an ID is found,
   * it attempts to find the corresponding element in the DOM and restores focus to it.
   * If the element is not visible within the viewport, it scrolls it into view.
   */
  restoreFocusedElement() {
    const storedId = localStorage.getItem('focusedElementId');
    if (storedId) {
      const elementToFocus = document.getElementById(storedId);

      if (elementToFocus && this.hasFocusableClass(elementToFocus)) {
        elementToFocus.scrollIntoView({ behavior: 'smooth', block: 'center' });
        elementToFocus.focus();
        elementToFocus.click();
      }
    }
  }

  /**
   * Clears the saved focus information from local storage.
   *
   * This method removes the saved element ID from `localStorage` to clean up any stored state.
   */
  clearFocusedElement() {
    localStorage.removeItem('focusedElementId');
  }

  /**
   * Helper method to determine if an element has any of the focusable classes.
   *
   * @param element The HTML element to check.
   * @returns True if the element has any class from the `focusableElementClasses` array; otherwise, false.
   */
  private hasFocusableClass(element: HTMLElement): boolean {
    return this.focusableElementClasses.some((className) => element.classList.contains(className));
  }
}
