import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalEventsService {
  private confirmClickSubject = new Subject<void>();

  confirmClick$ = this.confirmClickSubject.asObservable();

  emitConfirmClick() {
    this.confirmClickSubject.next();
  }
}
