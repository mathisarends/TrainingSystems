import { inject } from '@angular/core';
import { HttpRequest, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from './loading.service';

export function loadingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  console.log('🚀 ~ loadingInterceptor ~ req:', req);
  const loadingService = inject(LoadingService);

  if (req.url.includes('/user/auth-state') || req.method !== 'GET' || req.url.includes('latest')) {
    return next(req);
  }

  loadingService.startLoading();

  return next(req).pipe(
    finalize(() => {
      loadingService.stopLoading();
    }),
  );
}
