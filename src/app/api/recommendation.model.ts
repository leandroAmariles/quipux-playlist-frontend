export enum RecommendationOrigin {
  AI = 'IA',
  FALLBACK = 'RESPALDO',
  SIMILARITY = 'SIMILITUD',
}

export interface Recommendation {
  /** Empty when the suggestion was not checked against a catalogue. */
  catalogId: string;
  title: string;
  artist: string;
  genre: string;
  reason: string;
}

export interface RecommendationSet {
  origin: RecommendationOrigin;
  items: Recommendation[];
}
