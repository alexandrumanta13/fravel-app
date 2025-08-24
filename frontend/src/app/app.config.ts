import { ApplicationConfig, importProvidersFrom } from '@angular/core';

import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';

import { SharedModule } from './shared/shared.module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideClientHydration(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
    importProvidersFrom(MatNativeDateModule, SharedModule),
  ],
};
