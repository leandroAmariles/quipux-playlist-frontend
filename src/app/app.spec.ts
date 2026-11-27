import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { click, find, textOf } from '../testing/dom';
import fixtures from '../testing/fixtures/session.json';
import { tokenFor } from '../testing/session-token';
import { App } from './app';
import { AppRoute } from './core/constants/app-route';
import { UiText } from './core/constants/ui-text';
import { SessionStore } from './core/session/session-store';

describe('App', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  function render(): ComponentFixture<App> {
    const fixture = TestBed.createComponent(App);
    TestBed.tick();
    return fixture;
  }

  it('shows who is signed in and lets them leave', () => {
    const store = TestBed.inject(SessionStore);
    store.open(tokenFor(fixtures.admin));
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = render();
    expect(textOf(fixture)).toContain(fixtures.admin.sub);

    click(fixture, 'header button');

    expect(store.session()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(AppRoute.LOGIN);
    expect(find(fixture, 'header button')).toBeNull();
  });

  it('shows neither without a session', () => {
    const fixture = render();

    expect(find(fixture, 'header button')).toBeNull();
    expect(textOf(fixture)).not.toContain(UiText.LOG_OUT);
  });
});
