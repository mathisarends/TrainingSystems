import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * The AutoSaveService is responsible for triggering auto-save events when form inputs
 * are changed, allowing the application to automatically persist data without requiring direct user actions.
 */
@Injectable({ providedIn: 'root' })
export class AutoSaveService {
  /**
   * A Subject that emits when an input change has occurred and data should be saved.
   */
  private inputChangedSubject = new Subject<void>();

  /**
   * Observable that can be subscribed to in order to react to input changes and trigger auto-saving.
   */
  inputChanged$ = this.inputChangedSubject.asObservable();

  /**
   * Triggers an event to notify that an input has changed and data should be persisted.
   */
  save(): void {
    this.inputChangedSubject.next();
  }
}
