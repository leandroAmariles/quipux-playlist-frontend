function encodeSegment(value: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function buildJwt(claims: Record<string, unknown>): string {
  return `${encodeSegment({ alg: 'HS256' })}.${encodeSegment(claims)}.signature`;
}

export function epochSecondsFromNow(seconds: number): number {
  return Math.floor(Date.now() / 1000) + seconds;
}
