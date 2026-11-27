import { TestBed } from '@angular/core/testing';
import fixtures from '../../../testing/fixtures/session.json';
import { buildJwt } from '../../../testing/jwt';
import { tokenFor } from '../../../testing/session-token';
import { Role } from '../constants/role';
import { SessionStore } from './session-store';

describe('SessionStore', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => vi.useRealTimers());

  it('reads the user, role and expiry from the token', () => {
    const store = TestBed.inject(SessionStore);
    const before = Date.now();

    store.open(tokenFor(fixtures.admin));

    expect(store.session()?.username).toBe(fixtures.admin.sub);
    expect(store.session()?.role).toBe(Role.ADMIN);
    expect(store.isAdmin()).toBe(true);
    expect(store.session()!.expiresAt).toBeGreaterThan(before);
  });

  it('keeps non ASCII user names', () => {
    const store = TestBed.inject(SessionStore);

    store.open(tokenFor(fixtures.accented));

    expect(store.session()?.username).toBe(fixtures.accented.sub);
    expect(store.isAdmin()).toBe(false);
  });

  it('gives no management rights to an unknown role', () => {
    const store = TestBed.inject(SessionStore);

    store.open(tokenFor(fixtures.unknownRole));

    expect(store.isAdmin()).toBe(false);
  });

  it.each(fixtures.unreadableTokens)('opens no session with the unreadable token %j', (token) => {
    const store = TestBed.inject(SessionStore);

    expect(store.open(token)).toBeNull();
    expect(store.session()).toBeNull();
  });

  it('opens no session without an expiry, or when it already expired', () => {
    const store = TestBed.inject(SessionStore);

    expect(store.open(buildJwt(fixtures.admin))).toBeNull();
    expect(store.open(tokenFor(fixtures.admin, -1))).toBeNull();
  });

  it('survives a page reload', () => {
    TestBed.inject(SessionStore).open(tokenFor(fixtures.admin));
    TestBed.resetTestingModule();

    const reloaded = TestBed.inject(SessionStore);

    expect(reloaded.activeSession()?.username).toBe(fixtures.admin.sub);
  });

  it('closes itself once the token expires', () => {
    vi.useFakeTimers();
    const store = TestBed.inject(SessionStore);
    store.open(tokenFor(fixtures.admin));

    vi.advanceTimersByTime((fixtures.lifetimeSeconds + 1) * 1000);

    expect(store.activeSession()).toBeNull();
    expect(store.session()).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });

  it('forgets the session when closed', () => {
    const store = TestBed.inject(SessionStore);
    store.open(tokenFor(fixtures.admin));

    store.close();

    expect(store.session()).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });
});
