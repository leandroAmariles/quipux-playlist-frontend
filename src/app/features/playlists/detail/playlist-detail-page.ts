import { Component, effect, inject, input, OnDestroy, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PlaylistApi } from '../../../api/playlist-api';
import { Playlist } from '../../../api/playlist.model';
import { AppRoute } from '../../../core/constants/app-route';
import { HttpStatus } from '../../../core/constants/http-status';
import { UiText } from '../../../core/constants/ui-text';
import { ViewState } from '../../../core/constants/view-state';
import { errorMessage, hasStatus } from '../../../core/http/error-message';
import { RecommendationsPanel } from './recommendations/recommendations-panel';

@Component({
  selector: 'app-playlist-detail-page',
  imports: [RouterLink, RecommendationsPanel],
  templateUrl: './playlist-detail-page.html',
  styleUrl: './playlist-detail-page.css',
})
export class PlaylistDetailPage implements OnDestroy {
  private readonly playlistApi = inject(PlaylistApi);
  private readonly router = inject(Router);
  private pending?: Subscription;

  readonly name = input<string | string[]>();

  protected readonly text = UiText;
  protected readonly route = AppRoute;
  protected readonly viewState = ViewState;
  protected readonly state = signal(ViewState.LOADING);
  protected readonly playlist = signal<Playlist | null>(null);
  protected readonly error = signal<UiText | null>(null);

  constructor() {
    effect(() => {
      this.name();
      untracked(() => this.load());
    });
  }

  ngOnDestroy(): void {
    this.pending?.unsubscribe();
  }

  protected load(): void {
    const name = this.name();
    if (typeof name !== 'string' || !name) {
      void this.router.navigateByUrl(AppRoute.PLAYLISTS);
      return;
    }
    this.pending?.unsubscribe();
    this.state.set(ViewState.LOADING);
    this.pending = this.playlistApi.get(name).subscribe({
      next: (playlist) => {
        this.playlist.set(playlist);
        this.state.set(ViewState.READY);
      },
      error: (failure: unknown) => {
        this.error.set(errorMessage(failure));
        this.state.set(
          hasStatus(failure, HttpStatus.NOT_FOUND) ? ViewState.NOT_FOUND : ViewState.ERROR,
        );
      },
    });
  }
}
