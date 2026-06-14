import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@auth/interceptors/auth.interceptor';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es'

registerLocaleData(localeEs,'es')
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
     provideHttpClient(
      withFetch(),
      withInterceptors([
        // loggingInterceptor,
        authInterceptor,
      ])
    ),
     { provide: LOCALE_ID, useValue: 'es' },
  ]
};
