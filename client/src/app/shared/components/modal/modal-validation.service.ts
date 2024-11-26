import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModalValidationService {
  isValid = signal<boolean>(true);

  updateValidationState(isValid: boolean): void {
    this.isValid.set(isValid);
  }
}
