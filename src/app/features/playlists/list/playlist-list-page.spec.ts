import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { click, find, findAll, textOf } from '../../../../testing/dom';
import fixtures from '../../../../testing/fixtures/playlists.json';
import sessions from '../../../../testing/fixtures/session.json';
import { tokenFor } from '../../../../testing/session-token';
import { ApiPath, playlistPath } from '../../../core/constants/api-path';
import { AppRoute } from '../../../core/constants/app-route';
import { HttpStatus } from '../../../core/constants/http-status';
import { confirmDeleteText, UiText } from '../../../core/constants/ui-text';
import { SessionStore } from '../../../core/session/session-store';
import { PlaylistListPage } from './playlist-list-page';

describe('PlaylistListPage', () => {
  let fixture: ComponentFixture<PlaylistListPage>;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    http.verify();
  });

  function render(): void {
    fixture = TestBed.createComponent(PlaylistListPage);
    TestBed.tick();
  }

  function answer(body: object): void {
    http.expectOne(ApiPath.PLAYLISTS).flush(body);
    TestBed.tick();
  }

  function names(): string[] {
    return findAll(fixture, 'li a').map((link) => link.textContent!.trim());
  }

  it('shows the loading state until the answer arrives', () => {
    render();

    expect(textOf(fixture)).toContain(UiText.LOADING);
    answer([]);
    expect(textOf(fixture)).not.toContain(UiText.LOADING);
  });

  it('shows each playlist with its description in the order received', () => {
    render();

    answer(fixtures.playlists);

    expect(names()).toEqual(['Rock', 'Jazz']);
    expect(textOf(fixture)).toContain(fixtures.playlists[0].descripcion!);
  });

  it('links each playlist to its detail by name, whatever characters it has', () => {
    render();

    answer(fixtures.specialNames.map((nombre) => ({ nombre, descripcion: null, canciones: [] })));

    const router = TestBed.inject(Router);
    const linked = findAll(fixture, 'li a').map((link) => {
      const url = router.parseUrl(link.getAttribute('href')!);
      expect(link.getAttribute('href')!.startsWith(`${AppRoute.PLAYLIST_DETAIL}?`)).toBe(true);
      return url.queryParams['name'] as string;
    });
    expect(linked).toEqual(fixtures.specialNames);
  });

  it('says when there are no playlists', () => {
    render();

    answer([]);

    expect(textOf(fixture)).toContain(UiText.NO_PLAYLISTS);
  });

  it('shows an error and retries on demand', () => {
    render();
    http.expectOne(ApiPath.PLAYLISTS).error(new ProgressEvent('error'));
    TestBed.tick();
    expect(textOf(fixture)).toContain(UiText.GENERIC_ERROR);

    click(fixture, '.retry');
    answer(fixtures.playlists);

    expect(names()).toEqual(['Rock', 'Jazz']);
    expect(textOf(fixture)).not.toContain(UiText.GENERIC_ERROR);
  });

  function signIn(claims: Record<string, unknown>): void {
    TestBed.inject(SessionStore).open(tokenFor(claims));
  }

  it('offers an administrator to create a playlist', () => {
    signIn(sessions.admin);
    render();
    answer(fixtures.playlists);

    expect(find(fixture, 'a.create')!.getAttribute('href')).toBe(AppRoute.PLAYLIST_NEW);
  });

  it('does not offer a user to create a playlist', () => {
    signIn(sessions.user);
    render();
    answer(fixtures.playlists);

    expect(find(fixture, 'a.create')).toBeNull();
    expect(textOf(fixture)).not.toContain(UiText.CREATE_PLAYLIST);
  });

  describe('deletion', () => {
    const [rock, jazz] = fixtures.playlists;

    function open(claims: Record<string, unknown> = sessions.admin): void {
      signIn(claims);
      render();
      answer(fixtures.playlists);
    }

    function confirming(answerOfUser: boolean) {
      return vi.spyOn(window, 'confirm').mockReturnValue(answerOfUser);
    }

    function deleteFirst(): void {
      click(fixture, 'li:first-child .delete');
    }

    function answerDelete(status: number): void {
      const request = http.expectOne(playlistPath(rock.nombre));
      expect(request.request.method).toBe('DELETE');
      request.flush(null, { status, statusText: 'answer' });
      TestBed.tick();
    }

    it('asks for confirmation naming the playlist and does nothing when cancelled', () => {
      const confirm = confirming(false);
      open();

      deleteFirst();

      expect(confirm).toHaveBeenCalledWith(confirmDeleteText(rock.nombre));
      http.expectNone(playlistPath(rock.nombre));
      expect(names()).toEqual([rock.nombre, jazz.nombre]);
    });

    it('deletes and asks for the list again', () => {
      confirming(true);
      open();

      deleteFirst();
      answerDelete(204);
      answer([jazz]);

      expect(names()).toEqual([jazz.nombre]);
    });

    it('warns that the playlist is already gone and asks for the list again', () => {
      confirming(true);
      open();

      deleteFirst();
      answerDelete(HttpStatus.NOT_FOUND);
      answer([jazz]);

      expect(textOf(fixture)).toContain(UiText.PLAYLIST_ALREADY_GONE);
      expect(names()).toEqual([jazz.nombre]);
    });

    it('keeps the playlist and warns when deleting fails', () => {
      confirming(true);
      open();

      deleteFirst();
      answerDelete(500);

      expect(textOf(fixture)).toContain(UiText.GENERIC_ERROR);
      expect(names()).toEqual([rock.nombre, jazz.nombre]);
    });

    it('cannot delete again while a deletion is in progress', () => {
      const confirm = confirming(true);
      open();

      deleteFirst();
      deleteFirst();

      expect(confirm).toHaveBeenCalledTimes(1);
      expect(findAll<HTMLButtonElement>(fixture, '.delete').map((b) => b.disabled)).toEqual([
        true,
        true,
      ]);
      answerDelete(204);
      answer([jazz]);
    });

    it('is not offered to a user', () => {
      open(sessions.user);

      expect(find(fixture, '.delete')).toBeNull();
      expect(textOf(fixture)).not.toContain(UiText.DELETE);
    });
  });
});
