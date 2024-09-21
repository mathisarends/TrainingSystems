import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Service that allows components to communicate button click events with optional string messages.
 * Used to enable communication between more options button in header and according page.
 */
@Injectable({
  providedIn: 'root',
})
export class ButtonClickService {
  /**
   * A private Subject that emits string messages when a button is clicked.
   */
  private buttonClickSubject = new Subject<string | undefined>();

  /**
   * An Observable stream that other components can subscribe to in order to receive button click events.
   */
  buttonClick$ = this.buttonClickSubject.asObservable();

  /**
   * Emits a button click event with a message.
   *
   * @param message - The message to emit when the button is clicked.
   */
  emitButtonClick(message?: string) {
    this.buttonClickSubject.next(message);
  }
}
