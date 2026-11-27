export interface Song {
  title: string | null;
  artist: string | null;
  album: string | null;
  year: string | null;
  genre: string | null;
}

export interface Playlist {
  name: string;
  description: string | null;
  songs: Song[];
}
