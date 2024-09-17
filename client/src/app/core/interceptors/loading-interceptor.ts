import { inject } from '@angular/core';
import { HttpRequest, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../loading.service';

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
  const loadingService = inject(LoadingService);

  const urlBlacklist: string[] = ['/latest', 'skipLoading=true'];

  const isBlacklisted = urlBlacklist.some((pattern) => req.url.includes(pattern));

  if (isBlacklisted || req.method !== 'GET') {
    return next(req);
  }

  loadingService.startLoading();

  return next(req).pipe(
    finalize(() => {
      loadingService.stopLoading();
    }),
  );
}
