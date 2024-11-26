import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ModalService } from '../../../core/services/modal/modal.service';

@Injectable({ providedIn: 'root' })
export class ModalValidationService {
  isValid = signal<boolean>(true);

  /**
   * Subject to trigger form validation across components.
   */
  private triggerFormValidationSubject = new Subject<void>();

  /**
   * Observable to notify subscribers to trigger form validation.
   */
  triggerFormValidation$: Observable<void> = this.triggerFormValidationSubject.asObservable();

  constructor(private modalService: ModalService) {}

  updateValidationState(isValid: boolean): void {
    this.isValid.set(isValid);
  }

  /**
   * Triggers client-side validation by emitting an event to all subscribers.
   */
  triggerFormValidation(): void {
    this.triggerFormValidationSubject.next();
  }
}
