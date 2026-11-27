import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { click, find, findAll, textOf } from '../../../../testing/dom';
import fixtures from '../../../../testing/fixtures/playlists.json';
import { playlistPath } from '../../../core/constants/api-path';
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
});
