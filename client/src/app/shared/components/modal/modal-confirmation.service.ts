import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalConfirmationService {
  private confirmationSubject = new BehaviorSubject<boolean | null>(null);

  /**
   * Triggers a confirmation action.
   * @returns Observable<boolean>
   */
  requestConfirmation() {
    return this.confirmationSubject.asObservable();
  }

  /**
   * Confirms the action.
   */
  confirm() {
    this.confirmationSubject.next(true);
  }

  /**
   * Cancels the action.
   */
  cancel() {
    this.confirmationSubject.next(false);
  }
}
