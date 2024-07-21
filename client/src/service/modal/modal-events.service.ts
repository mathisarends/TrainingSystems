import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalEventsService {
  private confirmClickSubject = new Subject<string | void>();
  private abortClickSubject = new Subject<void>();

  /**
   * An observable that emits when the confirm click event occurs.
   * Components can subscribe to this observable to react to click events
   * on the submit button in a modal and then perform specific actions such as
   * submitting a form.
   */
  confirmClick$ = this.confirmClickSubject.asObservable();

  /**
   * An observable that emits when the abort click event occurs.
   * Components can subscribe to this observable to react to click events
   * on the abort button in a modal and then perform specific actions such as
   * closing the modal without saving changes.
   */
  abortClick$ = this.abortClickSubject.asObservable();

  /**
   * Emits the confirm click event to all subscribers.
   * This method is used to notify subscribers that the submit button in the modal
   * has been clicked, allowing them to perform specific actions related to the
   * modal content, such as form submission.
   */
  emitConfirmClick(id?: string) {
    this.confirmClickSubject.next(id);
  }

  /**
   * Emits the abort click event to all subscribers.
   * This method is used to notify subscribers that the abort button in the modal
   * has been clicked, allowing them to perform specific actions such as closing
   * the modal without saving changes.
   */
  emitAbortClick() {
    this.abortClickSubject.next();
  }
}
