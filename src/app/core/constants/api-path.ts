export const API_PREFIX = '/api/';

export enum ApiPath {
  LOGIN = '/api/auth/login',
  PLAYLISTS = '/api/lists',
  GENRES = '/api/genres',
}

export function playlistPath(name: string): string {
  return `${ApiPath.PLAYLISTS}/${encodeURIComponent(name)}`;
}

export function recommendationsPath(name: string): string {
  return `${playlistPath(name)}/recommendations`;
}
