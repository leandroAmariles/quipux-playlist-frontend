import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { find, submit, textOf, type } from '../../../testing/dom';
import fixtures from '../../../testing/fixtures/session.json';
import { tokenFor } from '../../../testing/session-token';
import { ApiPath } from '../../core/constants/api-path';
import { AppRoute } from '../../core/constants/app-route';
import { HttpStatus } from '../../core/constants/http-status';
import { UiText } from '../../core/constants/ui-text';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let http: HttpTestingController;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(LoginPage);
    TestBed.tick();
  });

  afterEach(() => http.verify());

  function fillAndSubmit(): void {
    type(fixture, '[formcontrolname=username]', fixtures.credentials.username);
    type(fixture, '[formcontrolname=password]', fixtures.credentials.password);
    submit(fixture);
  }

  function button(): HTMLButtonElement {
    return find<HTMLButtonElement>(fixture, 'button[type=submit]')!;
  }

  it('asks for the missing fields without calling the API', () => {
    type(fixture, '[formcontrolname=username]', '   ');
    submit(fixture);

    expect(textOf(fixture)).toContain(UiText.USERNAME_REQUIRED);
    expect(textOf(fixture)).toContain(UiText.PASSWORD_REQUIRED);
    http.expectNone(ApiPath.LOGIN);
  });

  it('goes to the playlists after signing in', () => {
    fillAndSubmit();

    http.expectOne(ApiPath.LOGIN).flush({ accessToken: tokenFor(fixtures.admin) });

    expect(navigate).toHaveBeenCalledWith(AppRoute.PLAYLISTS);
  });

  it('shows a credentials error in the form', () => {
    fillAndSubmit();

    http
      .expectOne(ApiPath.LOGIN)
      .flush(null, { status: HttpStatus.UNAUTHORIZED, statusText: 'error' });
    TestBed.tick();

    expect(textOf(fixture)).toContain(UiText.CREDENTIALS_INVALID);
    expect(button().disabled).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('shows a different message when the API fails', () => {
    fillAndSubmit();

    http.expectOne(ApiPath.LOGIN).error(new ProgressEvent('error'));
    TestBed.tick();

    expect(textOf(fixture)).toContain(UiText.GENERIC_ERROR);
    expect(textOf(fixture)).not.toContain(UiText.CREDENTIALS_INVALID);
  });

  it('cannot be sent twice', () => {
    fillAndSubmit();
    submit(fixture);

    expect(button().disabled).toBe(true);
    http.expectOne(ApiPath.LOGIN).flush({ accessToken: tokenFor(fixtures.admin) });
  });
});
