import { provideRouter } from '@angular/router';
import { API_URL } from './core/tokens/api-url.token';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { routes } from './app.routes';
import { environment } from '@env/environment';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),

    { provide: API_URL, useValue: environment.apiUrl },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },

    provideMomentDateAdapter()
  ]
};