import { HttpRequest, HttpEvent, HttpHandlerFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { ToastService } from '../../app/components/toast/toast.service';
import { ToastStatus } from '../../app/components/toast/toast-status';
import { Router } from '@angular/router';

/**
 * Intercepts HTTP requests to handle errors globally.
 *
 * @param req - The outgoing HTTP request.
 * @param next - The next interceptor in the chain, or the backend if no interceptors remain.
 * @returns An observable of the HTTP event, possibly an error.
 */
export function httpErrorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const toastService = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred!';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Client Error: ${error.error.message}`;
      } else {
        // Server-side error
        errorMessage = `Server Error Code: ${error.status}\nMessage: ${error.message}`;

        // Spezifische Behandlung für 401 Unauthorized
        if (error.status === 401) {
          errorMessage = 'Unauthorized access. Please log in again.';
          router.navigate(['/login']);
        }
        // Weitere spezifische Statuscode-Behandlungen können hier hinzugefügt werden
        if (error.status === 404) {
          errorMessage = 'Resource not found. Please check the URL.';
        }
      }

      toastService.show('Fehler', errorMessage, ToastStatus.ERROR);

      // Logge den Fehler zur Konsole
      console.error(errorMessage);

      // Return a dummy HttpResponse to prevent the app from crashing
      return of(new HttpResponse({ body: null }));
    }),
  );
}
