import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, InjectionToken} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

// creamos un injection token para la url de la api
export const API_URL = new InjectionToken<string>('API_URL');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    { provide: API_URL, useValue: 'http://72.61.37.244:5259/api//' } 
  ]
};