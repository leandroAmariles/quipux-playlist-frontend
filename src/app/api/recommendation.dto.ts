import { RecommendationOrigin } from './recommendation.model';

export interface RecommendationDto {
  idCatalogo: string;
  titulo: string;
  artista: string;
  genero: string;
  motivo: string;
}

export interface RecommendationsDto {
  lista: string;
  origen: RecommendationOrigin;
  versionPrompt: string;
  recomendaciones: RecommendationDto[];
}
