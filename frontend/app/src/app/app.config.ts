import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HttpHeaders } from '@angular/common/http';

import { routes } from './app.routes';

import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';

import { AuthTokenService } from './auth-token.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),

    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const tokenService = inject(AuthTokenService);

      const authLink = setContext(() => {
        const token = tokenService.getToken();

        let headers = new HttpHeaders();

        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        }

        return { headers };
      });

      return {
        link: authLink.concat(
          httpLink.create({
            uri: 'http://127.0.0.1:8000/graphql',
          })
        ),
        cache: new InMemoryCache(),
      };
    }),
  ],
};
