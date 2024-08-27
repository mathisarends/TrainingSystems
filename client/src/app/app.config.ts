import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { httpErrorInterceptor } from '../service/util/http-error-interceptor';
import { loadingInterceptor } from '../service/util/loading-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    provideHttpClient(withInterceptors([httpErrorInterceptor, loadingInterceptor])),
  ],
};
