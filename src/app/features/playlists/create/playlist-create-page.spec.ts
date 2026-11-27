import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { click, find, findAll, submit, textOf, type } from '../../../../testing/dom';
import forms from '../../../../testing/fixtures/forms.json';
import genres from '../../../../testing/fixtures/genres.json';
import problems from '../../../../testing/fixtures/problems.json';
import { ApiPath } from '../../../core/constants/api-path';
import { AppRoute } from '../../../core/constants/app-route';
import { HttpStatus } from '../../../core/constants/http-status';
import { UiText } from '../../../core/constants/ui-text';
import { PlaylistCreatePage } from './playlist-create-page';

describe('PlaylistCreatePage', () => {
  const { name, description, songTitles } = forms.newPlaylist;
  let fixture: ComponentFixture<PlaylistCreatePage>;
  let http: HttpTestingController;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(PlaylistCreatePage);
    TestBed.tick();
  });

  afterEach(() => http.verify());

  function answerGenres(): void {
    http.expectOne(ApiPath.GENRES).flush(genres);
    TestBed.tick();
  }

  function addSongs(titles: string[]): void {
    titles.forEach((title, index) => {
      click(fixture, '.add-song');
      type(fixture, `.song:nth-of-type(${index + 1}) [formcontrolname=title]`, title);
    });
  }

  function songValues(): string[] {
    return findAll<HTMLInputElement>(fixture, '.song [formcontrolname=title]').map(
      (field) => field.value,
    );
  }

  function save(): void {
    type(fixture, '[formcontrolname=name]', name);
    type(fixture, '[formcontrolname=description]', description);
    submit(fixture);
  }

  function reject(status: number, body: object | null = null): void {
    http.expectOne(ApiPath.PLAYLISTS).flush(body, { status, statusText: 'error' });
    TestBed.tick();
  }

  function expectTypedDataToRemain(): void {
    expect(find<HTMLInputElement>(fixture, '[formcontrolname=name]')!.value).toBe(name);
    expect(songValues()).toEqual(songTitles);
    expect(navigate).not.toHaveBeenCalled();
  }

  it('requires a name that is not blank, without calling the API', () => {
    answerGenres();
    type(fixture, '[formcontrolname=name]', '   ');

    submit(fixture);

    expect(textOf(fixture)).toContain(UiText.NAME_REQUIRED);
    http.expectNone(ApiPath.PLAYLISTS);
  });

  it('adds and removes songs, keeping the data and order of the others', () => {
    answerGenres();
    addSongs(songTitles);

    click(fixture, '.song:nth-of-type(2) .remove-song');

    expect(songValues()).toEqual([songTitles[0], songTitles[2]]);
    save();
    const request = http.expectOne(ApiPath.PLAYLISTS);
    expect(request.request.body.canciones.map((song: { titulo: string }) => song.titulo)).toEqual([
      songTitles[0],
      songTitles[2],
    ]);
  });

  it('offers the genres of the API and the option of none', () => {
    answerGenres();
    click(fixture, '.add-song');

    const options = findAll<HTMLOptionElement>(fixture, '.song option');

    expect(options.map((option) => option.value)).toEqual(['', ...genres.generos]);
    expect(options[0].textContent!.trim()).toBe(UiText.NO_GENRE);
  });

  it('sends the chosen genre and goes back to the playlists', () => {
    answerGenres();
    addSongs([songTitles[0]]);
    type(fixture, '.song [formcontrolname=genre]', genres.generos[1]);

    save();
    const request = http.expectOne(ApiPath.PLAYLISTS);
    request.flush(
      { nombre: name, descripcion: description, canciones: [] },
      { status: 201, statusText: 'Created' },
    );

    expect(request.request.body.nombre).toBe(name);
    expect(request.request.body.canciones[0].genero).toBe(genres.generos[1]);
    expect(navigate).toHaveBeenCalledWith(AppRoute.PLAYLISTS);
  });

  it('warns when the genres cannot be loaded, retries and still allows saving', () => {
    http.expectOne(ApiPath.GENRES).error(new ProgressEvent('error'));
    TestBed.tick();
    expect(textOf(fixture)).toContain(UiText.GENRES_UNAVAILABLE);
    addSongs([songTitles[0]]);
    save();
    http.expectOne(ApiPath.PLAYLISTS).error(new ProgressEvent('error'));
    TestBed.tick();

    click(fixture, '.retry-genres');
    answerGenres();

    expect(textOf(fixture)).not.toContain(UiText.GENRES_UNAVAILABLE);
    expect(findAll(fixture, '.song option')).toHaveLength(genres.generos.length + 1);
  });

  it('shows the API detail of a 400 without losing what was typed', () => {
    answerGenres();
    addSongs(songTitles);
    save();

    reject(HttpStatus.BAD_REQUEST, problems.unknownGenre);

    expect(textOf(fixture)).toContain(UiText.INVALID_DATA);
    expect(textOf(fixture)).toContain(problems.unknownGenre.detail);
    expectTypedDataToRemain();
  });

  it('says that the name is taken on a 409', () => {
    answerGenres();
    addSongs(songTitles);
    save();

    reject(HttpStatus.CONFLICT, problems.nameTaken);

    expect(textOf(fixture)).toContain(UiText.NAME_TAKEN);
    expect(textOf(fixture)).not.toContain(problems.nameTaken.detail);
    expectTypedDataToRemain();
  });

  it('says that the permission is missing on a 403', () => {
    answerGenres();
    save();

    reject(HttpStatus.FORBIDDEN);

    expect(textOf(fixture)).toContain(UiText.FORBIDDEN);
  });

  it('cannot be saved twice', () => {
    answerGenres();
    save();

    submit(fixture);

    expect(find<HTMLButtonElement>(fixture, 'button[type=submit]')!.disabled).toBe(true);
    http.expectOne(ApiPath.PLAYLISTS);
  });
});
