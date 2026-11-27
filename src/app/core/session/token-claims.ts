export interface TokenClaims {
  sub: string;
  role: string;
  exp: number;
}

function decodeSegment(segment: string): unknown {
  const binary = atob(segment.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

export function readTokenClaims(token: string): TokenClaims | null {
  try {
    const claims = decodeSegment(token.split('.')[1]) as Partial<TokenClaims> | null;
    const complete =
      typeof claims?.sub === 'string' &&
      typeof claims.role === 'string' &&
      typeof claims.exp === 'number';
    return complete ? (claims as TokenClaims) : null;
  } catch {
    return null;
  }
}
