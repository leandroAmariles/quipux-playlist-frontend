import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import fixtures from '../../../testing/fixtures/session.json';
import { tokenFor } from '../../../testing/session-token';
import { ApiPath } from '../constants/api-path';
import { AppRoute } from '../constants/app-route';
import { HttpStatus } from '../constants/http-status';
import { REQUEST_TIMEOUT_MS } from '../constants/settings';
import { SessionStore } from '../session/session-store';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let store: SessionStore;
  let navigate: ReturnType<typeof vi.spyOn>;
  let token: string;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    store = TestBed.inject(SessionStore);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    token = tokenFor(fixtures.admin);
    store.open(token);
  });

  afterEach(() => backend.verify());

  function fail(url: string, status: number): void {
    http.get(url).subscribe({ error: () => undefined });
    backend.expectOne(url).flush(null, { status, statusText: 'error' });
  }

  it('adds the token and a time limit to API requests', () => {
    http.get(ApiPath.PLAYLISTS).subscribe();

    const { request } = backend.expectOne(ApiPath.PLAYLISTS);

    expect(request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    expect(request.timeout).toBe(REQUEST_TIMEOUT_MS);
  });

  it('keeps a longer time limit set by the request', () => {
    const longer = REQUEST_TIMEOUT_MS * 3;

    http.get(ApiPath.PLAYLISTS, { timeout: longer }).subscribe();

    expect(backend.expectOne(ApiPath.PLAYLISTS).request.timeout).toBe(longer);
  });

  it('does not add the token to the login request', () => {
    http.post(ApiPath.LOGIN, {}).subscribe();

    const { request } = backend.expectOne(ApiPath.LOGIN);

    expect(request.headers.has('Authorization')).toBe(false);
  });

  it('does not add the token outside the API', () => {
    http.get('https://example.org/api/lists').subscribe();

    const { request } = backend.expectOne('https://example.org/api/lists');

    expect(request.headers.has('Authorization')).toBe(false);
  });

  it('closes the session and goes to the login on a 401', () => {
    fail(ApiPath.PLAYLISTS, HttpStatus.UNAUTHORIZED);

    expect(store.session()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(AppRoute.LOGIN);
  });

  it('does not redirect on the 401 of the login itself', () => {
    fail(ApiPath.LOGIN, HttpStatus.UNAUTHORIZED);

    expect(navigate).not.toHaveBeenCalled();
  });

  it('keeps the session on any other error', () => {
    fail(ApiPath.PLAYLISTS, HttpStatus.FORBIDDEN);

    expect(store.session()).not.toBeNull();
    expect(navigate).not.toHaveBeenCalled();
  });
});
