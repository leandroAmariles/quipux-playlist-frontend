import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApi } from '../../api/auth-api';
import { AppRoute } from '../../core/constants/app-route';
import { HttpStatus } from '../../core/constants/http-status';
import { UiText } from '../../core/constants/ui-text';
import { notBlank } from '../../core/forms/not-blank';
import { errorMessage, hasStatus } from '../../core/http/error-message';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);

  protected readonly text = UiText;
  protected readonly form = inject(NonNullableFormBuilder).group({
    username: ['', notBlank],
    password: ['', notBlank],
  });
  protected readonly attempted = signal(false);
  protected readonly submitting = signal(false);
  protected readonly error = signal<UiText | null>(null);

  protected submit(): void {
    if (this.submitting()) {
      return;
    }
    this.attempted.set(true);
    if (this.form.invalid) {
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    this.authApi.login(this.form.getRawValue()).subscribe({
      next: () => void this.router.navigateByUrl(AppRoute.PLAYLISTS),
      error: (failure: unknown) => {
        this.submitting.set(false);
        this.error.set(
          hasStatus(failure, HttpStatus.UNAUTHORIZED)
            ? UiText.CREDENTIALS_INVALID
            : errorMessage(failure),
        );
      },
    });
  }
}
