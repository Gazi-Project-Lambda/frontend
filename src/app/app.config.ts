import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { tokenInterceptor } from './interceptors/token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // All requests will now go to the real endpoints.
    // The tokenInterceptor will continue to work correctly.
    provideHttpClient(withInterceptors([tokenInterceptor])),
  ]
};