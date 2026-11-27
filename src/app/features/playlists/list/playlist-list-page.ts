import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { PlaylistApi } from '../../../api/playlist-api';
import { Playlist } from '../../../api/playlist.model';
import { AppRoute } from '../../../core/constants/app-route';
import { HttpStatus } from '../../../core/constants/http-status';
import { confirmDeleteText, UiText } from '../../../core/constants/ui-text';
import { ViewState } from '../../../core/constants/view-state';
import { errorMessage, hasStatus } from '../../../core/http/error-message';
import { SessionStore } from '../../../core/session/session-store';

@Component({
  selector: 'app-playlist-list-page',
  imports: [RouterLink],
  templateUrl: './playlist-list-page.html',
  styleUrl: './playlist-list-page.css',
})
export class PlaylistListPage {
  private readonly playlistApi = inject(PlaylistApi);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly text = UiText;
  protected readonly route = AppRoute;
  protected readonly viewState = ViewState;
  protected readonly isAdmin = inject(SessionStore).isAdmin;
  protected readonly state = signal(ViewState.LOADING);
  protected readonly playlists = signal<Playlist[]>([]);
  protected readonly error = signal<UiText | null>(null);
  protected readonly deleting = signal(false);
  protected readonly notice = signal<UiText | null>(null);

  constructor() {
    this.load();
  }

  protected remove(playlist: Playlist): void {
    if (this.deleting() || !window.confirm(confirmDeleteText(playlist.name))) {
      return;
    }
    this.deleting.set(true);
    this.notice.set(null);
    this.playlistApi.delete(playlist.name).subscribe({
      next: () => this.finishRemoval(),
      error: (failure: unknown) => {
        if (hasStatus(failure, HttpStatus.NOT_FOUND)) {
          this.notice.set(UiText.PLAYLIST_ALREADY_GONE);
          this.finishRemoval();
        } else {
          this.notice.set(errorMessage(failure));
          this.deleting.set(false);
        }
      },
    });
  }

  private finishRemoval(): void {
    this.deleting.set(false);
    if (!this.destroyRef.destroyed) {
      this.load();
    }
  }

  protected load(): void {
    this.state.set(ViewState.LOADING);
    this.playlistApi
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (playlists) => {
          this.playlists.set(playlists);
          this.state.set(playlists.length ? ViewState.READY : ViewState.EMPTY);
        },
        error: (failure: unknown) => {
          this.error.set(errorMessage(failure));
          this.state.set(ViewState.ERROR);
        },
      });
  }
}
