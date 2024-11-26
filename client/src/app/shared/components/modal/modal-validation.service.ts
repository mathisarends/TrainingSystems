import { Injectable, signal } from '@angular/core';
import { ModalService } from '../../../core/services/modal/modal.service';

@Injectable({ providedIn: 'root' })
export class ModalValidationService {
  isValid = signal<boolean>(true);

  constructor(private modalService: ModalService) {}

  updateValidationState(isValid: boolean): void {
    this.isValid.set(isValid);
  }
}
