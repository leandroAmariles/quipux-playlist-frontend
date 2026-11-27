import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import fixtures from '../../testing/fixtures/session.json';
import { tokenFor } from '../../testing/session-token';
import { ApiPath } from '../core/constants/api-path';
import { SessionStore } from '../core/session/session-store';
import { AuthApi } from './auth-api';

describe('AuthApi', () => {
  let api: AuthApi;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(AuthApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts the credentials and opens the session with the token', () => {
    const accessToken = tokenFor(fixtures.admin);
    let username: string | undefined;

    api.login(fixtures.credentials).subscribe((session) => (username = session.username));
    const request = http.expectOne(ApiPath.LOGIN);
    request.flush({ accessToken, tokenType: 'Bearer', expiresIn: fixtures.lifetimeSeconds });

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(fixtures.credentials);
    expect(username).toBe(fixtures.admin.sub);
    expect(TestBed.inject(SessionStore).session()?.token).toBe(accessToken);
  });

  it('fails when the token cannot be read', () => {
    let failed = false;

    api.login(fixtures.credentials).subscribe({ error: () => (failed = true) });
    http.expectOne(ApiPath.LOGIN).flush({ accessToken: 'abc', tokenType: 'Bearer', expiresIn: 1 });

    expect(failed).toBe(true);
    expect(TestBed.inject(SessionStore).session()).toBeNull();
  });
});
