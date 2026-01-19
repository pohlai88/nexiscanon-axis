// packages/auth/src/neon/jwks.ts
// JWKS fetching and caching for JWT verification

export type JsonWebKey = {
  kty: string;
  use?: string;
  kid: string;
  alg?: string;
  n?: string;
  e?: string;
  x?: string;
  y?: string;
  crv?: string;
};

export type JsonWebKeySet = {
  keys: JsonWebKey[];
};

type CachedJwks = {
  jwks: JsonWebKeySet;
  fetchedAt: number;
};

// In-memory cache with TTL
const cache = new Map<string, CachedJwks>();
const CACHE_TTL_MS = 3600 * 1000; // 1 hour

/**
 * Fetch JWKS from URL with caching.
 * Cache TTL: 1 hour (avoid rate limits, balance with key rotation).
 */
export async function fetchJwks(jwksUrl: string): Promise<JsonWebKeySet> {
  const now = Date.now();
  const cached = cache.get(jwksUrl);

  // Return cached if still valid
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.jwks;
  }

  // Fetch fresh JWKS
  try {
    const response = await fetch(jwksUrl, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(
        `JWKS fetch failed: ${response.status} ${response.statusText}`
      );
    }

    const jwks = (await response.json()) as JsonWebKeySet;

    // Validate structure
    if (!jwks.keys || !Array.isArray(jwks.keys)) {
      throw new Error("Invalid JWKS format: missing keys array");
    }

    // Cache for future requests
    cache.set(jwksUrl, { jwks, fetchedAt: now });

    return jwks;
  } catch (error) {
    // If fetch fails but we have stale cache, return it
    if (cached) {
      console.warn(
        `JWKS fetch failed, using stale cache (age: ${Math.round((now - cached.fetchedAt) / 1000)}s)`,
        error
      );
      return cached.jwks;
    }

    throw error;
  }
}

/**
 * Find key by kid from JWKS.
 */
export function findKey(
  jwks: JsonWebKeySet,
  kid: string
): JsonWebKey | undefined {
  return jwks.keys.find((key) => key.kid === kid);
}
