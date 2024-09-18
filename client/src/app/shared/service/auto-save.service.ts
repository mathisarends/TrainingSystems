import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AutoSaveService {
  private inputChangedSubject = new Subject<void>();
  inputChanged$ = this.inputChangedSubject.asObservable();

  /**
   * Checks if the value of the input element has changed upon losing focus,
   * and triggers an event if a change is detected.
   *
   * @param value - The current value of the input element.
   */
  save(): void {
    this.inputChangedSubject.next();
  }
}
