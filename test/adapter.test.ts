import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { check } from '../src/checker.ts';
import { loadAdapter } from '../src/adapter.ts';

const fixture = (name: string) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));
const cli = fileURLToPath(new URL('../src/cli.ts', import.meta.url));
const reports = fileURLToPath(new URL('../reports/failure.json', import.meta.url));

test('adapter: a correct external module passes, a reject-all module is caught', async () => {
  const good = await loadAdapter(fixture('good-adapter.mjs'));
  assert.equal(check(good(100000), 100000, [{ id: 'a', amount: 5 }]), null);
  const bad = await loadAdapter(fixture('reject-adapter.mjs'));
  assert.equal(check(bad(100000), 100000, [{ id: 'a', amount: 5 }])?.rule, 'model-status-mismatch');
});

test('adapter: throwing and malformed services become failures, not crashes', async () => {
  const thrower = await loadAdapter(fixture('throw-adapter.mjs'));
  assert.equal(check(thrower(10), 10, [{ id: 'a', amount: 1 }])?.rule, 'service-threw');
  const badShape = { total: () => 0, refund: () => ({ status: 'maybe' as never }) };
  assert.equal(check(badShape, 10, [{ id: 'a', amount: 1 }])?.rule, 'contract-violation');
  const noResult = { total: () => 0, refund: () => undefined as never };
  assert.equal(check(noResult, 10, [{ id: 'a', amount: 1 }])?.rule, 'contract-violation');
});

test('adapter: invalid modules are rejected with clear errors', async () => {
  await assert.rejects(loadAdapter(fixture('no-create-adapter.mjs')), /export function create/);
  await assert.rejects(loadAdapter(fixture('missing.mjs')));
});

test('CLI check-module: exit 0 for good, 1 for reject-all, 2 for bad module; writes no report', () => {
  const existedBefore = existsSync(reports);
  const run = (file: string) =>
    spawnSync(process.execPath, [cli, 'check-module', fixture(file)], {
      encoding: 'utf8',
      timeout: 15000,
    });
  assert.equal(run('good-adapter.mjs').status, 0);
  const rejected = run('reject-adapter.mjs');
  assert.equal(rejected.status, 1);
  assert.match(rejected.stdout, /model-status-mismatch/);
  assert.equal(run('no-create-adapter.mjs').status, 2);
  assert.equal(spawnSync(process.execPath, [cli, 'check-module']).status, 2);
  assert.equal(existsSync(reports), existedBefore);
});
