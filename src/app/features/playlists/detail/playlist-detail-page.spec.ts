import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { click, find, findAll, textOf } from '../../../../testing/dom';
import fixtures from '../../../../testing/fixtures/playlists.json';
import recommendations from '../../../../testing/fixtures/recommendations.json';
import { playlistPath, recommendationsPath } from '../../../core/constants/api-path';
import { AppRoute } from '../../../core/constants/app-route';
import { HttpStatus } from '../../../core/constants/http-status';
import { UiText } from '../../../core/constants/ui-text';
import { PlaylistDetailPage } from './playlist-detail-page';

describe('PlaylistDetailPage', () => {
  const [rock, jazz] = fixtures.playlists;
  let fixture: ComponentFixture<PlaylistDetailPage>;
  let http: HttpTestingController;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(() => http.verify());

  function render(name?: string): void {
    fixture = TestBed.createComponent(PlaylistDetailPage);
    fixture.componentRef.setInput('name', name);
    TestBed.tick();
  }

  function answer(name: string, body: object): void {
    http.expectOne(playlistPath(name)).flush(body);
    TestBed.tick();
  }

  it('shows the loading state until the answer arrives', () => {
    render(rock.nombre);

    expect(textOf(fixture)).toContain(UiText.LOADING);
    answer(rock.nombre, rock);
    expect(textOf(fixture)).not.toContain(UiText.LOADING);
  });

  it('shows the playlist with its songs, never printing null', () => {
    render(rock.nombre);

    answer(rock.nombre, rock);

    expect(find(fixture, 'h1')!.textContent).toContain(rock.nombre);
    expect(textOf(fixture)).toContain(rock.descripcion!);
    const rows = findAll(fixture, 'tbody tr').map((row) =>
      Array.from(row.querySelectorAll('td'), (cell) => cell.textContent!.trim()),
    );
    expect(rows).toEqual([
      ['Uno', 'Artista A', 'Primero', '1999', 'rock'],
      ['Dos', ...Array(4).fill(UiText.MISSING_VALUE)],
    ]);
    expect(textOf(fixture)).not.toContain('null');
  });

  it('says when the playlist has no songs', () => {
    render(jazz.nombre);

    answer(jazz.nombre, jazz);

    expect(textOf(fixture)).toContain(UiText.NO_SONGS);
  });

  it('says when the playlist does not exist and offers the way back', () => {
    render('Pop');

    http
      .expectOne(playlistPath('Pop'))
      .flush(null, { status: HttpStatus.NOT_FOUND, statusText: 'error' });
    TestBed.tick();

    expect(textOf(fixture)).toContain(UiText.PLAYLIST_NOT_FOUND);
    expect(find(fixture, 'a')!.getAttribute('href')).toBe(AppRoute.PLAYLISTS);
  });

  it('shows an error and retries on demand', () => {
    render(rock.nombre);
    http.expectOne(playlistPath(rock.nombre)).error(new ProgressEvent('error'));
    TestBed.tick();
    expect(textOf(fixture)).toContain(UiText.GENERIC_ERROR);

    click(fixture, '.retry');
    answer(rock.nombre, rock);

    expect(textOf(fixture)).toContain(rock.descripcion!);
  });

  it('goes back to the playlists without a name', () => {
    render();

    expect(navigate).toHaveBeenCalledWith(AppRoute.PLAYLISTS);
  });

  describe('recommendations', () => {
    const button = () => find<HTMLButtonElement>(fixture, 'button.recommend');

    function songTitles(): string[] {
      return findAll(fixture, 'table:first-of-type tbody tr td:first-child').map((cell) =>
        cell.textContent!.trim(),
      );
    }

    it('are not offered while the playlist is loading, failing or missing', () => {
      render(rock.nombre);
      expect(button()).toBeNull();

      http.expectOne(playlistPath(rock.nombre)).error(new ProgressEvent('error'));
      TestBed.tick();
      expect(button()).toBeNull();

      click(fixture, '.retry');
      http
        .expectOne(playlistPath(rock.nombre))
        .flush(null, { status: HttpStatus.NOT_FOUND, statusText: 'error' });
      TestBed.tick();
      expect(button()).toBeNull();
    });

    it.each([rock, jazz])('are offered, but not asked for, on opening $nombre', (playlist) => {
      render(playlist.nombre);

      answer(playlist.nombre, playlist);

      expect(button()).not.toBeNull();
      http.expectNone(recommendationsPath(playlist.nombre));
    });

    it('leave the songs in sight while they are being fetched', () => {
      render(rock.nombre);
      answer(rock.nombre, rock);

      click(fixture, 'button.recommend');

      expect(textOf(fixture)).toContain(UiText.RECOMMENDATIONS_LOADING);
      expect(songTitles()).toEqual(['Uno', 'Dos']);
      http.expectOne(recommendationsPath(rock.nombre)).flush(recommendations.ai);
    });

    it('leave the playlist and the way back in place when they fail', () => {
      render(rock.nombre);
      answer(rock.nombre, rock);
      click(fixture, 'button.recommend');

      http
        .expectOne(recommendationsPath(rock.nombre))
        .flush(null, { status: HttpStatus.NOT_FOUND, statusText: 'error' });
      TestBed.tick();

      expect(textOf(fixture)).toContain(UiText.PLAYLIST_NOT_FOUND);
      expect(find(fixture, 'h1')!.textContent).toContain(rock.nombre);
      expect(songTitles()).toEqual(['Uno', 'Dos']);
      expect(find(fixture, 'a')!.getAttribute('href')).toBe(AppRoute.PLAYLISTS);
    });

    it('are cancelled and forgotten when the page shows another playlist', () => {
      render(rock.nombre);
      answer(rock.nombre, rock);
      click(fixture, 'button.recommend');
      const pending = http.expectOne(recommendationsPath(rock.nombre));

      fixture.componentRef.setInput('name', jazz.nombre);
      TestBed.tick();

      expect(pending.cancelled).toBe(true);
      answer(jazz.nombre, jazz);
      expect(button()!.disabled).toBe(false);
      expect(textOf(fixture)).not.toContain(UiText.RECOMMENDATIONS_LOADING);
    });
  });
});
