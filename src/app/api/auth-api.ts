import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiPath } from '../core/constants/api-path';
import { Session, SessionStore } from '../core/session/session-store';
import { Credentials, LoginResponseDto } from './auth.dto';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly store = inject(SessionStore);

  login(credentials: Credentials): Observable<Session> {
    return this.http.post<LoginResponseDto>(ApiPath.LOGIN, credentials).pipe(
      map((response) => {
        const session = this.store.open(response.accessToken);
        if (!session) {
          throw new Error('Unreadable access token');
        }
        return session;
      }),
    );
  }
}
