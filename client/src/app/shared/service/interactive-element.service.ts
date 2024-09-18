import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * This service is used to automatically handle the process of tracking changes
 * to form inputs, specifically focusing on detecting changes between focus and blur events.
 * It is often used to save data automatically without requiring direct user intervention.
 */
@Injectable({ providedIn: 'root' })
export class InteractiveElementService {
  private momentaryInput: string | undefined;

  private inputChangedSubject = new Subject<void>();
  inputChanged$ = this.inputChangedSubject.asObservable();

  /**
   * Stores the current value of the input element when it gains focus.
   *
   * @param value - The current value of the input element.
   */
  focus(value: string): void {
    this.momentaryInput = value;
  }

  /**
   * Checks if the value of the input element has changed upon losing focus,
   * and triggers an event if a change is detected.
   *
   * @param value - The current value of the input element.
   */
  triggerChange(value: string): void {
    if (value !== this.momentaryInput) {
      this.inputChangedSubject.next(); // Notifies that the input value has changed
    }
  }
}
