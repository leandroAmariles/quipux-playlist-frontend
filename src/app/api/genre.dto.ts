import { GenreSource } from './genre.model';

export interface GenreCatalogDto {
  generos: string[];
  origen: GenreSource;
}
