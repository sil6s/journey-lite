/**
 * Translation rate limiter — two levels:
 *
 * 1. Per-document in-process lock (Map)
 *    Prevents two requests within the same Vercel instance from triggering
 *    duplicate translations for the same document+locale pair.
 *
 * 2. Global AI concurrency slot (semaphore)
 *    Caps simultaneous DeepSeek API calls to `MAX_CONCURRENT_AI_CALLS`.
 *    Prevents request spikes from exhausting rate limits or incurring large
 *    parallel costs.
 *
 * For cross-instance distributed locking, the Supabase `translation_cache`
 * `status="translating"` + `updated_at` timestamp is used as the lock —
 * see `isDistributedTranslationInProgress` in cache.ts.
 */

// ── Per-document lock ─────────────────────────────────────────────────────────

type LockKey = string; // `${documentId}:${locale}`
const inFlight = new Map<LockKey, Promise<void>>();

/**
 * Acquire the in-process lock for a document+locale pair.
 * If already held, waits for the current holder to release before returning.
 * Returns a `release()` function — always call it in a `finally` block.
 */
export async function acquireTranslationLock(
  documentId: string,
  locale: string,
): Promise<() => void> {
  const key: LockKey = `${documentId}:${locale}`;

  // If another async task in this process holds the lock, wait for it
  const existing = inFlight.get(key);
  if (existing) await existing;

  // Set up this caller's lock promise
  let release!: () => void;
  const lock = new Promise<void>((resolve) => {
    release = () => {
      inFlight.delete(key);
      resolve();
    };
  });
  inFlight.set(key, lock);
  return release;
}

export function isTranslationInFlight(documentId: string, locale: string): boolean {
  return inFlight.has(`${documentId}:${locale}`);
}

// ── AI concurrency semaphore ──────────────────────────────────────────────────

const MAX_CONCURRENT_AI_CALLS = 3;
let activeAiCalls = 0;
const aiQueue: Array<() => void> = [];

/**
 * Acquire a slot for making a DeepSeek API call.
 * Blocks until a slot is available (max `MAX_CONCURRENT_AI_CALLS` in flight).
 * Returns a `release()` function — always call in a `finally` block.
 */
export async function acquireAiCallSlot(): Promise<() => void> {
  if (activeAiCalls < MAX_CONCURRENT_AI_CALLS) {
    activeAiCalls++;
    return makeRelease();
  }

  return new Promise((resolve) => {
    aiQueue.push(() => resolve(makeRelease()));
  });
}

function makeRelease(): () => void {
  return () => {
    const next = aiQueue.shift();
    if (next) {
      next(); // hand the slot to the next waiter
    } else {
      activeAiCalls--;
    }
  };
}

export function activeAiCallCount(): number {
  return activeAiCalls;
}
