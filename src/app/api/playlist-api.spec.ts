import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import fixtures from '../../testing/fixtures/playlists.json';
import { ApiPath, playlistPath } from '../core/constants/api-path';
import { PlaylistApi } from './playlist-api';
import { Playlist } from './playlist.model';

describe('PlaylistApi', () => {
  let api: PlaylistApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(PlaylistApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists the playlists with English names and keeps missing values', () => {
    let result: Playlist[] = [];

    api.list().subscribe((playlists) => (result = playlists));
    const request = http.expectOne(ApiPath.PLAYLISTS);
    request.flush(fixtures.playlists);

    expect(request.request.method).toBe('GET');
    expect(result.map((playlist) => playlist.name)).toEqual(['Rock', 'Jazz']);
    expect(result[0].songs[0]).toEqual({
      title: 'Uno',
      artist: 'Artista A',
      album: 'Primero',
      year: '1999',
      genre: 'rock',
    });
    expect(result[0].songs[1]).toEqual({
      title: 'Dos',
      artist: null,
      album: null,
      year: null,
      genre: null,
    });
    expect(result[1]).toEqual({ name: 'Jazz', description: null, songs: [] });
  });

  it('gets one playlist by name', () => {
    let result: Playlist | undefined;

    api.get('Rock').subscribe((playlist) => (result = playlist));
    http.expectOne(playlistPath('Rock')).flush(fixtures.playlists[0]);

    expect(result?.description).toBe(fixtures.playlists[0].descripcion);
  });

  it('creates a playlist with the Spanish contract, sending empty fields as null', () => {
    let created: Playlist | undefined;
    const blank = { title: '', artist: '', album: '', year: '', genre: '' };

    api
      .create({
        name: ' Mix ',
        description: '',
        songs: [{ ...blank, title: 'Uno', genre: 'rock' }, blank],
      })
      .subscribe((playlist) => (created = playlist));
    const request = http.expectOne(ApiPath.PLAYLISTS);
    request.flush(fixtures.playlists[1]);

    const empty = { titulo: null, artista: null, album: null, anno: null, genero: null };
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      nombre: ' Mix ',
      descripcion: null,
      canciones: [{ ...empty, titulo: 'Uno', genero: 'rock' }, empty],
    });
    expect(created?.name).toBe('Jazz');
  });

  it.each(fixtures.specialNames)('deletes the playlist named %j', (name) => {
    api.delete(name).subscribe();

    const { request } = http.expectOne(playlistPath(name));

    expect(request.method).toBe('DELETE');
  });

  it.each(fixtures.specialNames)('sends the name %j as a single path segment', (name) => {
    api.get(name).subscribe();

    const { request } = http.expectOne(playlistPath(name));
    const segment = request.url.slice(`${ApiPath.PLAYLISTS}/`.length);

    expect(segment).not.toMatch(/[/?# ;]/);
    expect(decodeURIComponent(segment)).toBe(name);
  });
});
