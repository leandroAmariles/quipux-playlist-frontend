import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GenreApi } from '../../../api/genre-api';
import { PlaylistApi } from '../../../api/playlist-api';
import { AppRoute } from '../../../core/constants/app-route';
import { HttpStatus } from '../../../core/constants/http-status';
import { UiText } from '../../../core/constants/ui-text';
import { ViewState } from '../../../core/constants/view-state';
import { notBlank } from '../../../core/forms/not-blank';
import { errorMessage, hasStatus, problemDetail } from '../../../core/http/error-message';

function newSong(formBuilder: NonNullableFormBuilder) {
  return formBuilder.group({
    title: [''],
    artist: [''],
    album: [''],
    year: [''],
    genre: [''],
  });
}

type SongForm = ReturnType<typeof newSong>;

interface SaveError {
  message: UiText;
  detail: string | null;
}

function toSaveError(failure: unknown): SaveError {
  if (hasStatus(failure, HttpStatus.BAD_REQUEST)) {
    return { message: UiText.INVALID_DATA, detail: problemDetail(failure) };
  }
  if (hasStatus(failure, HttpStatus.CONFLICT)) {
    return { message: UiText.NAME_TAKEN, detail: null };
  }
  return { message: errorMessage(failure), detail: null };
}

@Component({
  selector: 'app-playlist-create-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './playlist-create-page.html',
  styleUrl: './playlist-create-page.css',
})
export class PlaylistCreatePage {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly genreApi = inject(GenreApi);
  private readonly playlistApi = inject(PlaylistApi);
  private readonly router = inject(Router);

  protected readonly text = UiText;
  protected readonly route = AppRoute;
  protected readonly viewState = ViewState;
  protected readonly form = this.formBuilder.group({
    name: ['', notBlank],
    description: [''],
    songs: this.formBuilder.array<SongForm>([]),
  });
  protected readonly genres = signal<string[]>([]);
  protected readonly genreState = signal(ViewState.LOADING);
  protected readonly attempted = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<SaveError | null>(null);

  constructor() {
    this.loadGenres();
  }

  protected loadGenres(): void {
    this.genreState.set(ViewState.LOADING);
    this.genreApi.catalog().subscribe({
      next: (catalog) => {
        this.genres.set(catalog.genres);
        this.genreState.set(ViewState.READY);
      },
      error: () => this.genreState.set(ViewState.ERROR),
    });
  }

  protected addSong(): void {
    this.form.controls.songs.push(newSong(this.formBuilder));
  }

  protected removeSong(index: number): void {
    this.form.controls.songs.removeAt(index);
  }

  protected save(): void {
    if (this.saving()) {
      return;
    }
    this.attempted.set(true);
    if (this.form.invalid) {
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.playlistApi.create(this.form.getRawValue()).subscribe({
      next: () => void this.router.navigateByUrl(AppRoute.PLAYLISTS),
      error: (failure: unknown) => {
        this.saving.set(false);
        this.error.set(toSaveError(failure));
      },
    });
  }
}
