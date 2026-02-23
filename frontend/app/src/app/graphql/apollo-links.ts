import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApolloLink, Observable } from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';

import { AuthTokenService } from '../auth-token.service';
import { ToastService } from '../shared/toast.service';
import { LoadingService } from '../shared/loading.service';

export function createErrorLink(): ApolloLink {
  const router = inject(Router);
  const auth = inject(AuthTokenService);
  const toast = inject(ToastService);

  return onError(({ graphQLErrors, networkError }: any) => {
    if (networkError) {
      toast.error('Server unreachable. Please try again.');
      return;
    }

    const first = graphQLErrors?.[0];
    const msg = (first?.message ?? '').toLowerCase();

    if (msg.includes('unauthorized') || msg.includes('jwt') || msg.includes('token')) {
      auth.clearToken();
      localStorage.removeItem('role');
      toast.error('Session expired. Please login again.');
      router.navigateByUrl('/login');
      return;
    }

    if (msg.includes('forbidden')) {
      toast.error('Access denied.');
      return;
    }

    if (first?.message) toast.error(first.message);
  });
}

export function createLoadingLink(): ApolloLink {
  const loading = inject(LoadingService);

  return new ApolloLink((operation, forward) => {
    loading.start();

    return new Observable((observer) => {
      const sub = forward(operation).subscribe({
        next: (v) => observer.next(v),
        error: (e) => observer.error(e),
        complete: () => observer.complete(),
      });

      return () => {
        sub.unsubscribe();
        loading.stop();
      };
    });
  });
}
