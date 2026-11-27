import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import fixtures from '../../../testing/fixtures/session.json';
import { tokenFor } from '../../../testing/session-token';
import { routes } from '../../app.routes';
import { AppRoute } from '../constants/app-route';
import { SESSION_STORAGE_KEY } from '../constants/settings';

describe('admin guard', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
  });

  async function visitCreation(claims?: Record<string, unknown>): Promise<string> {
    if (claims) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, tokenFor(claims));
    }
    await RouterTestingHarness.create(AppRoute.PLAYLIST_NEW);
    return TestBed.inject(Router).url;
  }

  it('lets an administrator in', async () => {
    expect(await visitCreation(fixtures.admin)).toBe(AppRoute.PLAYLIST_NEW);
  });

  it('sends a user back to the playlists', async () => {
    expect(await visitCreation(fixtures.user)).toBe(AppRoute.PLAYLISTS);
  });

  it('sends a visitor without session to the login', async () => {
    expect(await visitCreation()).toBe(AppRoute.LOGIN);
  });
});
