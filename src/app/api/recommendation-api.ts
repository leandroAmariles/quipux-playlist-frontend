import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { recommendationsPath } from '../core/constants/api-path';
import { RECOMMENDATIONS_TIMEOUT_MS } from '../core/constants/settings';
import { RecommendationsDto } from './recommendation.dto';
import { toRecommendationSet } from './recommendation.mapper';
import { RecommendationSet } from './recommendation.model';

@Injectable({ providedIn: 'root' })
export class RecommendationApi {
  private readonly http = inject(HttpClient);

  get(playlistName: string): Observable<RecommendationSet> {
    return this.http
      .get<RecommendationsDto>(recommendationsPath(playlistName), {
        timeout: RECOMMENDATIONS_TIMEOUT_MS,
      })
      .pipe(map(toRecommendationSet));
  }
}
