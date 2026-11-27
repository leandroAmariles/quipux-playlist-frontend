export enum GenreSource {
  SPOTIFY = 'SPOTIFY',
  LOCAL = 'LOCAL',
}

export interface GenreCatalog {
  genres: string[];
  source: GenreSource;
}
