import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import fixtures from '../../testing/fixtures/genres.json';
import { ApiPath } from '../core/constants/api-path';
import { GenreApi } from './genre-api';
import { GenreCatalog, GenreSource } from './genre.model';

describe('GenreApi', () => {
  it('gets the genre catalog', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    let catalog: GenreCatalog | undefined;

    TestBed.inject(GenreApi)
      .catalog()
      .subscribe((result) => (catalog = result));
    const request = http.expectOne(ApiPath.GENRES);
    request.flush(fixtures);

    expect(request.request.method).toBe('GET');
    expect(catalog).toEqual({ genres: fixtures.generos, source: GenreSource.LOCAL });
    http.verify();
  });
});
