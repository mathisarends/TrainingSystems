import { Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable()
export class KeyboardService {
  constructor() {}

  /**
   * Emits an event when "Ctrl + F" is pressed.
   * @returns An Observable of KeyboardEvent for "Ctrl + F".
   */
  ctrlFPressed$(): Observable<KeyboardEvent> {
    return fromEvent<KeyboardEvent>(document, 'keydown').pipe(
      filter((event: KeyboardEvent) => event.ctrlKey && event.key === 'f'),
    );
  }

  /**
   * Emits an event when the "Escape" key is pressed.
   * @returns An Observable of KeyboardEvent for "Escape".
   */
  escapePressed$(): Observable<KeyboardEvent> {
    return fromEvent<KeyboardEvent>(document, 'keydown').pipe(
      filter((event: KeyboardEvent) => event.key === 'Escape' || event.key === 'Esc'),
    );
  }

  /**
   * Emits an event when the "Enter" key is pressed.
   * @returns An Observable of KeyboardEvent for "Enter".
   */
  enterPressed$(): Observable<KeyboardEvent> {
    return fromEvent<KeyboardEvent>(document, 'keydown').pipe(filter((event: KeyboardEvent) => event.key === 'Enter'));
  }
}
