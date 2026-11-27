import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppRoute } from '../constants/app-route';
import { SessionStore } from '../session/session-store';

export const authGuard: CanActivateFn = () =>
  inject(SessionStore).activeSession() ? true : inject(Router).parseUrl(AppRoute.LOGIN);
