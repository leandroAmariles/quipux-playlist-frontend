export enum UiText {
  APP_TITLE = 'Listas de reproducción',
  LOG_OUT = 'Cerrar sesión',

  LOGIN_TITLE = 'Iniciar sesión',
  USERNAME = 'Usuario',
  PASSWORD = 'Contraseña',
  SIGN_IN = 'Entrar',
  USERNAME_REQUIRED = 'Escribe el usuario.',
  PASSWORD_REQUIRED = 'Escribe la contraseña.',
  CREDENTIALS_INVALID = 'Usuario o contraseña incorrectos.',

  PLAYLISTS_TITLE = 'Listas',
  NO_PLAYLISTS = 'Todavía no hay listas.',
  NO_SONGS = 'Esta lista no tiene canciones.',
  PLAYLIST_NOT_FOUND = 'No se encontró la lista.',
  BACK_TO_PLAYLISTS = 'Volver al listado',
  MISSING_VALUE = '—',

  NEW_PLAYLIST_TITLE = 'Nueva lista',
  CREATE_PLAYLIST = 'Crear lista',
  NAME = 'Nombre',
  DESCRIPTION = 'Descripción',
  SONGS = 'Canciones',
  SONG = 'Canción',
  SONG_TITLE = 'Título',
  ARTIST = 'Artista',
  ALBUM = 'Álbum',
  YEAR = 'Año',
  GENRE = 'Género',
  NO_GENRE = 'Sin género',
  ADD_SONG = 'Añadir canción',
  REMOVE_SONG = 'Quitar',
  SAVE = 'Guardar',
  NAME_REQUIRED = 'El nombre es obligatorio.',
  INVALID_DATA = 'Los datos no son válidos.',
  NAME_TAKEN = 'Ya existe una lista con ese nombre.',
  GENRES_UNAVAILABLE = 'No se pudieron cargar los géneros.',

  DELETE = 'Borrar',
  PLAYLIST_ALREADY_GONE = 'La lista ya no existe.',

  RECOMMENDATIONS = 'Recomendaciones',
  GET_RECOMMENDATIONS = 'Ver recomendaciones',
  RECOMMENDATIONS_LOADING = 'Buscando recomendaciones…',
  NO_RECOMMENDATIONS = 'No hay sugerencias para esta lista.',
  REASON = 'Motivo',
  ORIGIN_AI = 'Sugerencias generadas por IA.',
  ORIGIN_FALLBACK = 'Sugerencias de respaldo, no generadas por IA.',
  ORIGIN_SIMILARITY = 'Sugerencias elegidas por similitud en el catálogo.',
  UNVERIFIED_RECOMMENDATIONS = 'No están verificadas contra un catálogo: pueden contener errores.',

  TOO_MANY_REQUESTS = 'Has hecho demasiadas peticiones. Inténtalo de nuevo más tarde.',

  LOADING = 'Cargando…',
  RETRY = 'Reintentar',
  FORBIDDEN = 'No tienes permiso para esta operación.',
  GENERIC_ERROR = 'No se pudo completar la operación. Inténtalo de nuevo.',
}

export function confirmDeleteText(name: string): string {
  return `¿Borrar la lista «${name}»?`;
}

export function tooManyRequestsText(seconds: number): string {
  return `Has hecho demasiadas peticiones. Inténtalo de nuevo en ${seconds} s.`;
}
