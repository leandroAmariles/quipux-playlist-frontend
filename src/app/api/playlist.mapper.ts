import { PlaylistDto, SongDto } from './playlist.dto';
import { Playlist, Song } from './playlist.model';

function toSong(dto: SongDto): Song {
  return {
    title: dto.titulo,
    artist: dto.artista,
    album: dto.album,
    year: dto.anno,
    genre: dto.genero,
  };
}

function absentIfEmpty(value: string | null): string | null {
  return value || null;
}

function toSongDto(song: Song): SongDto {
  return {
    titulo: absentIfEmpty(song.title),
    artista: absentIfEmpty(song.artist),
    album: absentIfEmpty(song.album),
    anno: absentIfEmpty(song.year),
    genero: absentIfEmpty(song.genre),
  };
}

export function toPlaylistDto(playlist: Playlist): PlaylistDto {
  return {
    nombre: playlist.name,
    descripcion: absentIfEmpty(playlist.description),
    canciones: playlist.songs.map(toSongDto),
  };
}

export function toPlaylist(dto: PlaylistDto): Playlist {
  return {
    name: dto.nombre,
    description: dto.descripcion,
    songs: dto.canciones.map(toSong),
  };
}
