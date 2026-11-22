import { registerLocaleData } from '@angular/common';
import localeEsBo from '@angular/common/locales/es-BO';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';

// Formato local (separadores de miles/decimales) para los pipes number y currency.
registerLocaleData(localeEsBo);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding: los parámetros y `data` de la ruta llegan como input() al componente.
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(),
    { provide: LOCALE_ID, useValue: 'es-BO' },
  ],
};
