export interface SongDto {
  titulo: string | null;
  artista: string | null;
  album: string | null;
  anno: string | null;
  genero: string | null;
}

export interface PlaylistDto {
  nombre: string;
  descripcion: string | null;
  canciones: SongDto[];
}
