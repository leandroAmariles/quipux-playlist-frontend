import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AppRoute } from './core/constants/app-route';
import { UiText } from './core/constants/ui-text';
import { SessionStore } from './core/session/session-store';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);
  private readonly store = inject(SessionStore);

  protected readonly text = UiText;
  protected readonly session = this.store.session;

  protected logOut(): void {
    this.store.close();
    void this.router.navigateByUrl(AppRoute.LOGIN);
  }
}
