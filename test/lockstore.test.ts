import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkStore, generateStoreOps, minimizeStoreOps } from '../src/lockstore.ts';
import type { LockStore, StoreOp } from '../src/lockstore.ts';

const path = (rel: string) => fileURLToPath(new URL(rel, import.meta.url));
const load = async (file: string, maxSize: number): Promise<() => LockStore> => {
  const mod = (await import(new URL(`../examples/${file}`, import.meta.url).href)) as {
    create(o: { maxSize: number }): LockStore;
  };
  return () => mod.create({ maxSize });
};
const lock = (key: string): StoreOp => ({ op: 'lock', key });

test('case 001: upstream bug (paveg/hono-idempotency#89) reproduces on the real parent code', async () => {
  const parent = await load('hono-parent.mjs', 1);
  // Exact sequence from the issue: maxSize 1, k1 processing, k2 evicts k1, k1 locks again.
  const failure = await checkStore(parent, [lock('k1'), lock('k2'), lock('k1')]);
  assert.equal(failure?.rule, 'processing-key-relocked');
  assert.equal(failure?.step, 2);
  // Same sequence on the fixed upstream code passes.
  const fixed = await load('hono-fixed.mjs', 1);
  assert.equal(await checkStore(fixed, [lock('k1'), lock('k2'), lock('k1')]), null);
});

test('case 001: generated sequences find the bug in parent, never in fixed, and shrink', async () => {
  const parent = await load('hono-parent.mjs', 2);
  const fixed = await load('hono-fixed.mjs', 2);
  let found: StoreOp[] | undefined;
  for (let seed = 42; seed < 142; seed++) {
    const ops = generateStoreOps(seed);
    assert.deepEqual(ops, generateStoreOps(seed));
    assert.equal(await checkStore(fixed, ops), null);
    found ??= (await checkStore(parent, ops)) ? ops : undefined;
  }
  assert.ok(found, 'parent should fail for at least one seed');
  const rule = (await checkStore(parent, found))?.rule;
  const fails = async (xs: StoreOp[]) => (await checkStore(parent, xs))?.rule === rule;
  const small = await minimizeStoreOps(found, fails);
  assert.ok(small.length <= 4 && small.length < found.length);
  for (let i = 0; i < small.length; i++)
    assert.equal(await fails(small.filter((_, j) => j !== i)), false);
  await assert.rejects(minimizeStoreOps([], fails));
});

test('lock-store checker: spec cases and its own failure modes', async () => {
  const map = new Map<string, string>();
  const ok: () => LockStore = () => ({
    get: async (k) => (map.has(k) ? { status: map.get(k)! } : undefined),
    lock: async (k) => (map.has(k) ? false : (map.set(k, 'processing'), true)),
    complete: async (k) => void map.set(k, 'completed'),
    delete: async (k) => void map.delete(k),
  });
  map.clear();
  const ops: StoreOp[] = [
    lock('a'),
    lock('a'),
    { op: 'complete', key: 'a' },
    { op: 'delete', key: 'a' },
    lock('a'),
  ];
  assert.equal(await checkStore(ok, ops), null);
  const refuseAll: () => LockStore = () => ({ ...ok(), lock: async () => false });
  assert.equal((await checkStore(refuseAll, [lock('a')]))?.rule, 'new-key-lock-refused');
  const thrower: () => LockStore = () => ({
    ...ok(),
    get: async () => {
      throw new Error('x');
    },
  });
  assert.equal((await checkStore(thrower, [{ op: 'get', key: 'a' }]))?.rule, 'store-threw');
  assert.equal(
    (
      await checkStore(() => {
        throw new Error('no');
      }, [])
    )?.rule,
    'store-threw',
  );
  assert.throws(() => generateStoreOps(-1));
});

test('CLI check-store: parent exit 1, fixed exit 0, bad adapter exit 2', () => {
  const run = (...args: string[]) =>
    spawnSync(process.execPath, [path('../src/cli.ts'), 'check-store', ...args], {
      encoding: 'utf8',
      timeout: 20000,
    });
  const parent = run(path('../examples/hono-parent.mjs'));
  assert.equal(parent.status, 1);
  assert.match(parent.stdout, /processing-key-(lost|relocked)/);
  assert.equal(run(path('../examples/hono-fixed.mjs')).status, 0);
  assert.equal(run(path('./fixtures/no-create-adapter.mjs')).status, 2);
  assert.equal(run().status, 2);
});
