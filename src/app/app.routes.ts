import { Routes } from '@angular/router';
import { AppPath } from './core/constants/app-route';
import { adminGuard } from './core/guards/admin-guard';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import { LoginPage } from './features/login/login-page';
import { PlaylistCreatePage } from './features/playlists/create/playlist-create-page';
import { PlaylistDetailPage } from './features/playlists/detail/playlist-detail-page';
import { PlaylistListPage } from './features/playlists/list/playlist-list-page';

export const routes: Routes = [
  { path: AppPath.LOGIN, component: LoginPage, canActivate: [guestGuard] },
  { path: AppPath.PLAYLISTS, component: PlaylistListPage, canActivate: [authGuard] },
  { path: AppPath.PLAYLIST_DETAIL, component: PlaylistDetailPage, canActivate: [authGuard] },
  {
    path: AppPath.PLAYLIST_NEW,
    component: PlaylistCreatePage,
    canActivate: [authGuard, adminGuard],
  },
  { path: '**', redirectTo: AppPath.PLAYLISTS },
];
