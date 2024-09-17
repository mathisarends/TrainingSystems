import { HttpRequest, HttpEvent, HttpHandlerFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { ToastService } from '../../components/toast/toast.service';

/**
 * Intercepts HTTP requests to handle errors globally.
 *
 * @param req - The outgoing HTTP request.
 * @param next - The next interceptor in the chain, or the backend if no interceptors remain.
 * @returns An observable of the HTTP event, possibly an error.
 */
export function httpErrorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const toastService = inject(ToastService);

  const excludedRoutes = ['/user/authenticate-password-request'];

  const isExcluded = excludedRoutes.some((route) => req.url.includes(route));

  if (isExcluded) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage;
      let userFriendlyMessage;

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Client Error: ${error.error.message}`;
        userFriendlyMessage = 'Bitte versuchen Sie es erneut.';
      } else {
        // Server-side error

        switch (error.status) {
          case 400:
            console.log('here');
            errorMessage = 'Server Error Code: 400\nMessage: Bad Request';
            userFriendlyMessage = 'Ungültige Anfrage. Bitte überprüfen Sie Ihre Eingaben und versuchen Sie es erneut.';
            break;
          case 401:
            return throwError(() => error);
          case 403:
            errorMessage = 'Server Error Code: 403\nMessage: Forbidden';
            userFriendlyMessage =
              'Zugriff verweigert. Sie haben nicht die nötigen Berechtigungen, um diese Aktion durchzuführen.';
            break;
          case 404:
            errorMessage = 'Server Error Code: 404\nMessage: Not Found';
            userFriendlyMessage = 'Ressource nicht gefunden. Überprüfen Sie die URL und versuchen Sie es erneut.';
            break;
          case 500:
            errorMessage = 'Server Error Code: 500\nMessage: Internal Server Error';
            userFriendlyMessage = 'Es ist ein Fehler auf dem Server aufgetreten. Bitte versuchen Sie es später erneut.';
            break;
          case 503:
            errorMessage = 'Server Error Code: 503\nMessage: Service Unavailable';
            userFriendlyMessage = 'Der Dienst ist momentan nicht verfügbar. Bitte versuchen Sie es später erneut.';
            break;
          default:
            errorMessage = `Server Error Code: ${error.status}\nMessage: ${error.message}`;
            userFriendlyMessage = 'Es gab ein unerwartetes Problem. Bitte versuchen Sie es später erneut.';
        }
      }

      toastService.error(userFriendlyMessage);

      console.error(errorMessage);

      return of(new HttpResponse({ body: null }));
    }),
  );
}
