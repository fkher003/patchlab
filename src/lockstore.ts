// Second contract: a keyed lock store (the shape used by idempotency middleware).
// Observable-behavior checker; it never reads the store's internal Map.
//
// Adapter contract (check-store): ES module exporting
//   export function create(options: { maxSize: number }): LockStore
// LockStore methods are async. Property checked (from the upstream store's own doc comment
// "lock ... returns false if the key already exists"): a key that was locked and not yet
// completed/deleted is "processing"; it must stay visible to get() and lock() on it must
// return false. Evicting finished records when full is allowed, so nothing is asserted
// about completed keys.

export type LockRecord = {
  key: string;
  fingerprint: string;
  status: 'processing';
  createdAt: number;
};
export type LockStore = {
  get(key: string): Promise<{ status: string } | undefined>;
  lock(key: string, record: LockRecord): Promise<boolean>;
  complete(key: string, response: unknown): Promise<void>;
  delete(key: string): Promise<void>;
};
export type StoreFactory = () => LockStore | Promise<LockStore>;
export type StoreOp = { op: 'lock' | 'complete' | 'delete' | 'get'; key: string };
export type StoreFailure = {
  rule: 'processing-key-relocked' | 'processing-key-lost' | 'new-key-lock-refused' | 'store-threw';
  step: number;
  operation: StoreOp;
  detail: string;
};

export async function checkStore(
  factory: StoreFactory,
  ops: StoreOp[],
): Promise<StoreFailure | null> {
  const processing = new Set<string>();
  const seen = new Set<string>();
  let store: LockStore;
  try {
    store = await factory();
  } catch (error) {
    return {
      rule: 'store-threw',
      step: -1,
      operation: { op: 'get', key: '' },
      detail: String(error),
    };
  }
  for (const [step, operation] of ops.entries()) {
    const { op, key } = operation;
    const fail = (rule: StoreFailure['rule'], detail: string): StoreFailure => ({
      rule,
      step,
      operation,
      detail,
    });
    try {
      if (op === 'lock') {
        const got = await store.lock(key, {
          key,
          fingerprint: `fp-${key}`,
          status: 'processing',
          createdAt: Date.now(),
        });
        if (processing.has(key) && got)
          return fail('processing-key-relocked', 'lock succeeded on a key still processing');
        if (!seen.has(key) && !got)
          return fail('new-key-lock-refused', 'lock refused a key never used before');
        if (got) processing.add(key);
        seen.add(key);
      } else if (op === 'complete') {
        await store.complete(key, { status: 200 });
        processing.delete(key);
      } else if (op === 'delete') {
        await store.delete(key);
        processing.delete(key);
        seen.delete(key);
      } else {
        const found = await store.get(key);
        if (processing.has(key) && !found)
          return fail('processing-key-lost', 'get() lost a key that is still processing');
      }
    } catch (error) {
      return fail('store-threw', String(error));
    }
  }
  return null;
}

// Same seeded generator idea as src/generator.ts: deterministic, small key space so collisions happen.
export function generateStoreOps(seed: number, count = 30): StoreOp[] {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
    throw new Error('Seed must be an unsigned 32-bit integer');
  let state = seed >>> 0;
  const next = () => (state = (Math.imul(1664525, state) + 1013904223) >>> 0);
  const kinds: StoreOp['op'][] = ['lock', 'lock', 'lock', 'complete', 'delete', 'get'];
  return Array.from({ length: count }, () => ({
    op: kinds[next() % kinds.length]!,
    key: `k${next() % 5}`,
  }));
}

// Greedy single-deletion minimization (1-minimal, not global minimum), async version.
export async function minimizeStoreOps(
  ops: StoreOp[],
  fails: (xs: StoreOp[]) => Promise<boolean>,
): Promise<StoreOp[]> {
  if (!(await fails(ops))) throw new Error('Cannot minimize a passing sequence');
  let result = ops.slice();
  for (let index = 0; index < result.length; ) {
    const candidate = result.filter((_, i) => i !== index);
    if (await fails(candidate)) {
      result = candidate;
      index = 0;
    } else index++;
  }
  return result;
}
