import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { registerLocaleData } from '@angular/common';
import { endpointInterceptor } from '@shared/interceptors/endpoint-interceptor';
import localeTr from '@angular/common/locales/tr';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

registerLocaleData(localeTr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([endpointInterceptor])),
    { provide: LOCALE_ID, useValue: 'tr' },
  ],
};
