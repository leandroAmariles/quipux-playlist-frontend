import { computed, Injectable, signal } from '@angular/core';
import { Role } from '../constants/role';
import { SESSION_STORAGE_KEY } from '../constants/settings';
import { readTokenClaims } from './token-claims';

export interface Session {
  token: string;
  username: string;
  role: Role;
  expiresAt: number;
}

function toSession(token: string | null): Session | null {
  const claims = token ? readTokenClaims(token) : null;
  if (!token || !claims || claims.exp * 1000 <= Date.now()) {
    return null;
  }
  return {
    token,
    username: claims.sub,
    role: claims.role === Role.ADMIN ? Role.ADMIN : Role.USER,
    expiresAt: claims.exp * 1000,
  };
}

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly state = signal(toSession(sessionStorage.getItem(SESSION_STORAGE_KEY)));

  readonly session = this.state.asReadonly();
  readonly isAdmin = computed(() => this.state()?.role === Role.ADMIN);

  open(token: string): Session | null {
    const session = toSession(token);
    if (session) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, token);
      this.state.set(session);
    }
    return session;
  }

  activeSession(): Session | null {
    const session = this.state();
    if (session && session.expiresAt <= Date.now()) {
      this.close();
      return null;
    }
    return session;
  }

  close(): void {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    this.state.set(null);
  }
}
