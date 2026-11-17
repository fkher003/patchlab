import type { Request } from './refunds.ts';

// Small deterministic generator for teaching. Not cryptographic randomness.
export function generate(seed: number, count = 30): Request[] {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
    throw new Error('Seed must be an unsigned 32-bit integer');
  if (!Number.isInteger(count) || count < 0 || count > 10000) throw new Error('Invalid count');
  let state = seed >>> 0;
  const next = () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state;
  };
  const amounts = [-1, 0, 1, 10000, 30000, 40000, 60000, 100000, 100001];
  const requests: Request[] = [];
  for (let i = 0; i < count; i++) {
    const choice = next();
    if (requests.length && choice % 3 === 0) {
      const previous = requests[next() % requests.length];
      if (!previous) throw new Error('Generator selected a missing request');
      requests.push({ ...previous });
    } else {
      requests.push({ id: `request-${next() % 5}`, amount: amounts[next() % amounts.length]! });
    }
  }
  return requests;
}
