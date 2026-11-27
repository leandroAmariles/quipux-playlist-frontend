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

describe('session guards', () => {
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

  async function visit(url: string): Promise<string> {
    await RouterTestingHarness.create(url);
    return TestBed.inject(Router).url;
  }

  function signIn(lifetimeSeconds?: number): void {
    sessionStorage.setItem(SESSION_STORAGE_KEY, tokenFor(fixtures.admin, lifetimeSeconds));
  }

  it('sends a visitor without session to the login', async () => {
    expect(await visit(AppRoute.PLAYLISTS)).toBe(AppRoute.LOGIN);
  });

  it('treats an expired session as no session', async () => {
    signIn(-1);

    expect(await visit(AppRoute.PLAYLISTS)).toBe(AppRoute.LOGIN);
  });

  it('sends a signed in user away from the login', async () => {
    signIn();

    expect(await visit(AppRoute.LOGIN)).toBe(AppRoute.PLAYLISTS);
  });

  it('sends an unknown address to the playlists', async () => {
    signIn();

    expect(await visit('/nothing-here')).toBe(AppRoute.PLAYLISTS);
  });

  it('sends an unknown address without session to the login', async () => {
    expect(await visit('/nothing-here')).toBe(AppRoute.LOGIN);
  });
});
