import { createService } from './refunds.ts';
import type { Service } from './refunds.ts';
import { check, minimize } from './checker.ts';
import { generate } from './generator.ts';
import { checkStore, generateStoreOps, minimizeStoreOps } from './lockstore.ts';
import type { LockStore } from './lockstore.ts';

export type BenchRow = {
  target: string;
  expected: 'bug' | 'correct';
  sequences: number;
  failing: number;
  avgOriginal: number;
  avgMinimized: number;
};

const PAID = 100000;
const alwaysReject = (): Service => ({
  total: () => 0,
  refund: () => ({ status: 'exceeds-balance' }),
});

// Deterministic: seeds 0..n-1, no timing, so the table can be committed and re-derived.
export async function runBenchmark(
  n: number,
  stores: { name: string; expected: 'bug' | 'correct'; create: () => LockStore }[] = [],
): Promise<BenchRow[]> {
  if (!Number.isInteger(n) || n < 1 || n > 5000) throw new Error('n must be an integer in 1..5000');
  const rows: BenchRow[] = [];
  const refundTargets: [string, 'bug' | 'correct', () => Service][] = [
    ['refund fixed', 'correct', () => createService(PAID, 'fixed')],
    ['refund buggy (retry not recognised)', 'bug', () => createService(PAID, 'buggy')],
    ['refund always-reject (mutant)', 'bug', alwaysReject],
  ];
  for (const [target, expected, make] of refundTargets) {
    let failing = 0,
      original = 0,
      minimized = 0;
    for (let seed = 0; seed < n; seed++) {
      const requests = generate(seed);
      const failure = check(make(), PAID, requests);
      if (!failure) continue;
      failing++;
      original += requests.length;
      minimized += minimize(
        requests,
        (xs) => check(make(), PAID, xs)?.rule === failure.rule,
      ).length;
    }
    rows.push(row(target, expected, n, failing, original, minimized));
  }
  for (const { name, expected, create } of stores) {
    let failing = 0,
      original = 0,
      minimized = 0;
    for (let seed = 0; seed < n; seed++) {
      const ops = generateStoreOps(seed);
      const failure = await checkStore(create, ops);
      if (!failure) continue;
      failing++;
      original += ops.length;
      minimized += (
        await minimizeStoreOps(
          ops,
          async (xs) => (await checkStore(create, xs))?.rule === failure.rule,
        )
      ).length;
    }
    rows.push(row(name, expected, n, failing, original, minimized));
  }
  return rows;
}

function row(
  target: string,
  expected: BenchRow['expected'],
  n: number,
  failing: number,
  o: number,
  m: number,
): BenchRow {
  const avg = (x: number) => (failing ? Math.round((x / failing) * 10) / 10 : 0);
  return { target, expected, sequences: n, failing, avgOriginal: avg(o), avgMinimized: avg(m) };
}

export function toMarkdown(rows: BenchRow[]): string {
  const head =
    '| Target | Expected | Sequences | Failing | Detected | Avg length | Avg minimized |\n|---|---|---|---|---|---|---|';
  const body = rows.map(
    (r) =>
      `| ${r.target} | ${r.expected} | ${r.sequences} | ${r.failing} | ${((r.failing / r.sequences) * 100).toFixed(1)}% | ${r.avgOriginal} | ${r.avgMinimized} |`,
  );
  return [head, ...body].join('\n');
}
