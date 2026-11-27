import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiPath } from '../core/constants/api-path';
import { GenreCatalogDto } from './genre.dto';
import { GenreCatalog } from './genre.model';

@Injectable({ providedIn: 'root' })
export class GenreApi {
  private readonly http = inject(HttpClient);

  catalog(): Observable<GenreCatalog> {
    return this.http
      .get<GenreCatalogDto>(ApiPath.GENRES)
      .pipe(map((dto) => ({ genres: dto.generos, source: dto.origen })));
  }
}
