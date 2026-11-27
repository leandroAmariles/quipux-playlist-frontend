import { Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RecommendationApi } from '../../../../api/recommendation-api';
import { RecommendationOrigin, RecommendationSet } from '../../../../api/recommendation.model';
import { HttpStatus } from '../../../../core/constants/http-status';
import { tooManyRequestsText, UiText } from '../../../../core/constants/ui-text';
import { ViewState } from '../../../../core/constants/view-state';
import { errorMessage, hasStatus, retryAfterSeconds } from '../../../../core/http/error-message';

const ORIGIN_TEXTS: Record<RecommendationOrigin, UiText> = {
  [RecommendationOrigin.AI]: UiText.ORIGIN_AI,
  [RecommendationOrigin.FALLBACK]: UiText.ORIGIN_FALLBACK,
  [RecommendationOrigin.SIMILARITY]: UiText.ORIGIN_SIMILARITY,
};

function failureText(failure: unknown): string {
  if (hasStatus(failure, HttpStatus.TOO_MANY_REQUESTS)) {
    const seconds = retryAfterSeconds(failure);
    return seconds ? tooManyRequestsText(seconds) : UiText.TOO_MANY_REQUESTS;
  }
  return hasStatus(failure, HttpStatus.NOT_FOUND)
    ? UiText.PLAYLIST_NOT_FOUND
    : errorMessage(failure);
}

@Component({
  selector: 'app-recommendations-panel',
  templateUrl: './recommendations-panel.html',
  styleUrl: '../playlist-detail-page.css',
})
export class RecommendationsPanel {
  private readonly recommendationApi = inject(RecommendationApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly playlistName = input.required<string>();

  protected readonly text = UiText;
  protected readonly viewState = ViewState;
  protected readonly originTexts = ORIGIN_TEXTS;
  /** `null` until the user asks for the first time. */
  protected readonly state = signal<ViewState | null>(null);
  protected readonly result = signal<RecommendationSet | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly unverified = computed(() => {
    const result = this.result();
    return (
      result?.origin === RecommendationOrigin.AI && result.items.some((item) => !item.catalogId)
    );
  });

  protected request(): void {
    if (this.state() === ViewState.LOADING) {
      return;
    }
    this.state.set(ViewState.LOADING);
    this.result.set(null);
    this.error.set(null);
    this.recommendationApi
      .get(this.playlistName())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.result.set(result);
          this.state.set(ViewState.READY);
        },
        error: (failure: unknown) => {
          this.error.set(failureText(failure));
          this.state.set(ViewState.ERROR);
        },
      });
  }
}
