import fixtures from './fixtures/session.json';
import { buildJwt, epochSecondsFromNow } from './jwt';

export function tokenFor(
  claims: Record<string, unknown>,
  lifetimeSeconds: number = fixtures.lifetimeSeconds,
): string {
  return buildJwt({ ...claims, exp: epochSecondsFromNow(lifetimeSeconds) });
}
