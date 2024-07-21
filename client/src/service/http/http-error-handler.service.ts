import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorHandlerService {
  constructor() {}

  handleResponse<T>(observable: Observable<T>): Observable<T> {
    return observable.pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 499) {
          return EMPTY; // Ignore the error and complete the stream
        } else {
          console.error('HTTP Error:', error);
          return throwError(() => error);
        }
      })
    );
  }
}
