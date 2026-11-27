import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppRoute } from '../constants/app-route';
import { SessionStore } from '../session/session-store';

export const adminGuard: CanActivateFn = () =>
  inject(SessionStore).isAdmin() ? true : inject(Router).parseUrl(AppRoute.PLAYLISTS);
