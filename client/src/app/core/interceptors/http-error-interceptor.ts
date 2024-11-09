import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ErrorResponseDto } from '../../shared/dto/error-response-dto';

/**
 * Intercepts HTTP requests to handle errors globally.
 *
 * @param req - The outgoing HTTP request.
 * @param next - The next interceptor in the chain, or the backend if no interceptors remain.
 * @returns An observable of the HTTP event, possibly an error.
 */
export function httpErrorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isAuthenticationError(error)) {
        return throwError(() => error);
      }

      if (req.url.includes('/training/most-recent-plan-link')) {
        return throwError(() => error);
      }

      const serverError: ErrorResponseDto = error.error || { error: 'Ein unerwarteter Fehler ist aufgetreten.' };
      const errorMessage = `Client Error Code: ${error.status}\nMessage: ${serverError.error || error.message}`;

      toastService.error(serverError.error);
      console.error(errorMessage);

      return of(new HttpResponse({ body: null }));
    }),
  );
}

/**
 * Determines if the error is an authentication error (HTTP 401 Unauthorized).
 *
 * This check is necessary because 401 Unauthorized errors are typically handled
 * by the authentication guard, which will manage the redirection to a login page
 * or trigger other authentication flows.
 *
 */
function isAuthenticationError(httpError: HttpErrorResponse): boolean {
  return httpError.status === 401;
}
