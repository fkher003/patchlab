import test from 'node:test';
import assert from 'node:assert/strict';
import { runBenchmark, toMarkdown } from '../src/benchmark.ts';
import type { LockStore } from '../src/lockstore.ts';

type Create = (o: { maxSize: number }) => LockStore;
const load = async (file: string) =>
  ((await import(new URL(`../examples/${file}`, import.meta.url).href)) as { create: Create })
    .create;

test('benchmark: no false positives on correct targets, bugs detected, deterministic', async () => {
  const parent = await load('hono-parent.mjs');
  const fixed = await load('hono-fixed.mjs');
  const stores = [
    { name: 'fixed', expected: 'correct' as const, create: () => fixed({ maxSize: 2 }) },
    { name: 'parent', expected: 'bug' as const, create: () => parent({ maxSize: 2 }) },
  ];
  const rows = await runBenchmark(100, stores);
  assert.deepEqual(rows, await runBenchmark(100, stores));
  for (const r of rows) {
    if (r.expected === 'correct') assert.equal(r.failing, 0, r.target);
    else {
      assert.ok(r.failing > 0, r.target);
      assert.ok(r.avgMinimized < r.avgOriginal, r.target);
    }
  }
  assert.equal(rows.length, 5);
  assert.match(toMarkdown(rows), /\| parent \| bug \| 100 \|/);
});

test('benchmark: rejects invalid sizes', async () => {
  for (const n of [0, -1, 1.5, 5001]) await assert.rejects(runBenchmark(n));
});
