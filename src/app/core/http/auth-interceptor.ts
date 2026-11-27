import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_PREFIX, ApiPath } from '../constants/api-path';
import { AppRoute } from '../constants/app-route';
import { HttpStatus } from '../constants/http-status';
import { REQUEST_TIMEOUT_MS } from '../constants/settings';
import { SessionStore } from '../session/session-store';
import { hasStatus } from './error-message';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(API_PREFIX)) {
    return next(request);
  }
  const store = inject(SessionStore);
  const router = inject(Router);
  const isLogin = request.url === ApiPath.LOGIN;
  const token = isLogin ? undefined : store.session()?.token;
  const outgoing = request.clone({
    timeout: REQUEST_TIMEOUT_MS,
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return next(outgoing).pipe(
    catchError((error: unknown) => {
      if (!isLogin && hasStatus(error, HttpStatus.UNAUTHORIZED)) {
        store.close();
        void router.navigateByUrl(AppRoute.LOGIN);
      }
      return throwError(() => error);
    }),
  );
};
