import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

/**
 * HTTP interceptor function to manage the loading state for HTTP requests.
 *
 * This interceptor listens to outgoing HTTP requests and triggers the loading
 * state using the `LoadingService` unless the request meets certain exclusion criteria.
 *
 * @param req - The outgoing HTTP request to intercept.
 * @param next - The next handler in the HTTP request chain.
 * @returns An observable of the HTTP event stream.
 */
export function loadingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  if (shouldSkipLoading(req)) {
    return next(req);
  }

  const loadingService = inject(LoadingService);

  loadingService.startLoading();

  return next(req).pipe(
    finalize(() => {
      loadingService.stopLoading();
    }),
  );
}

/**
 * Determines whether the loading indicator should be skipped for this request.
 *
 * This function checks whether the request URL matches any patterns in the blacklist
 * or if the request method is not 'GET', in which case the loading indicator is skipped.
 *
 * @param req - The outgoing HTTP request.
 * @param blacklist - Array of URL patterns or keywords that should skip the loading logic.
 * @returns `true` if the loading logic should be skipped, `false` otherwise.
 */
function shouldSkipLoading(req: HttpRequest<unknown>): boolean {
  const urlBlacklist: string[] = ['skipLoading=true'];

  const isMethodNotGET = req.method !== 'GET';
  const isBlacklisted = urlBlacklist.some((pattern) => req.url.includes(pattern));

  return isMethodNotGET || isBlacklisted;
}
