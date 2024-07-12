import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Service to handle exercise-related events and state changes.
 *
 * The `ExerciseService` is used to manage events related to exercise plans,
 * such as when a reset is initiated and when it is successfully completed.
 */
@Injectable({
  providedIn: 'root',
})
export class ExerciseService {
  /**
   * Subject to emit when the exercise reset is initiated.
   */
  private preExerciseResetSubject = new Subject<void>();

  /**
   * Observable stream that components can subscribe to for pre-reset events.
   */
  preExerciseReset$ = this.preExerciseResetSubject.asObservable();

  /**
   * Subject to emit when the exercise reset is successfully completed.
   */
  private resetSuccessfulSubject = new Subject<void>();

  /**
   * Observable stream that components can subscribe to for reset successful events.
   */
  resetSuccessful$ = this.resetSuccessfulSubject.asObservable();

  /**
   * Emits an event to indicate that the exercise reset process has started.
   *
   * Components can subscribe to `preExerciseReset$` to perform actions before the reset.
   */
  exerciseResetInitiated(): void {
    this.preExerciseResetSubject.next();
  }

  /**
   * Emits an event to indicate that the exercise reset process has completed successfully.
   *
   * Components can subscribe to `resetSuccessful$` to perform actions after the reset.
   */
  exerciseResetSuccessful(): void {
    this.resetSuccessfulSubject.next();
  }
}
