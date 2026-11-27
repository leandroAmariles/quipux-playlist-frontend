import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import playlists from '../../testing/fixtures/playlists.json';
import fixtures from '../../testing/fixtures/recommendations.json';
import session from '../../testing/fixtures/session.json';
import { tokenFor } from '../../testing/session-token';
import { ApiPath, recommendationsPath } from '../core/constants/api-path';
import { RECOMMENDATIONS_TIMEOUT_MS } from '../core/constants/settings';
import { authInterceptor } from '../core/http/auth-interceptor';
import { SessionStore } from '../core/session/session-store';
import { RecommendationApi } from './recommendation-api';
import { RecommendationOrigin, RecommendationSet } from './recommendation.model';

describe('RecommendationApi', () => {
  let api: RecommendationApi;
  let http: HttpTestingController;
  let token: string;

  beforeEach(() => {
    sessionStorage.clear();
    // The real interceptor is installed: it sets the time limit of every API request.
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    token = tokenFor(session.user);
    TestBed.inject(SessionStore).open(token);
    api = TestBed.inject(RecommendationApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('asks with the token and waits longer than the API does for the model', () => {
    api.get('Rock').subscribe();

    const { request } = http.expectOne(recommendationsPath('Rock'));

    expect(request.method).toBe('GET');
    expect(request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    expect(request.timeout).toBe(RECOMMENDATIONS_TIMEOUT_MS);
  });

  it('maps the Spanish contract, keeping the order and the empty values', () => {
    let result: RecommendationSet | undefined;

    api.get('Rock').subscribe((set) => (result = set));
    http.expectOne(recommendationsPath('Rock')).flush(fixtures.ai);

    expect(result).toEqual({
      origin: RecommendationOrigin.AI,
      items: [
        {
          catalogId: '',
          title: 'Sugerida uno',
          artist: 'Artista X',
          genre: 'rock',
          reason: 'Mismo género y época',
        },
        { catalogId: '', title: 'Sugerida dos', artist: 'Artista Y', genre: '', reason: '' },
      ],
    });
  });

  it.each(playlists.specialNames)('sends the name %j as a single path segment', (name) => {
    api.get(name).subscribe();

    const { request } = http.expectOne(recommendationsPath(name));
    const [segment, ...rest] = request.url.slice(`${ApiPath.PLAYLISTS}/`.length).split('/');

    expect(rest).toEqual(['recommendations']);
    expect(segment).not.toMatch(/[?# ;]/);
    expect(decodeURIComponent(segment)).toBe(name);
  });
});
