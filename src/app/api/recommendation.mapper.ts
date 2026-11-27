import { RecommendationDto, RecommendationsDto } from './recommendation.dto';
import { Recommendation, RecommendationSet } from './recommendation.model';

function toRecommendation(dto: RecommendationDto): Recommendation {
  return {
    catalogId: dto.idCatalogo,
    title: dto.titulo,
    artist: dto.artista,
    genre: dto.genero,
    reason: dto.motivo,
  };
}

export function toRecommendationSet(dto: RecommendationsDto): RecommendationSet {
  return { origin: dto.origen, items: dto.recomendaciones.map(toRecommendation) };
}
