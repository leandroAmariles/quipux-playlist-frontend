import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiPath, playlistPath } from '../core/constants/api-path';
import { PlaylistDto } from './playlist.dto';
import { toPlaylist, toPlaylistDto } from './playlist.mapper';
import { Playlist } from './playlist.model';

@Injectable({ providedIn: 'root' })
export class PlaylistApi {
  private readonly http = inject(HttpClient);

  list(): Observable<Playlist[]> {
    return this.http
      .get<PlaylistDto[]>(ApiPath.PLAYLISTS)
      .pipe(map((playlists) => playlists.map(toPlaylist)));
  }

  get(name: string): Observable<Playlist> {
    return this.http.get<PlaylistDto>(playlistPath(name)).pipe(map(toPlaylist));
  }

  create(playlist: Playlist): Observable<Playlist> {
    return this.http
      .post<PlaylistDto>(ApiPath.PLAYLISTS, toPlaylistDto(playlist))
      .pipe(map(toPlaylist));
  }

  delete(name: string): Observable<void> {
    return this.http.delete<void>(playlistPath(name));
  }
}
