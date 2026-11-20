import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

test('exported regression runs when the CLI is invoked outside its checkout', (t) => {
  const cwd = mkdtempSync(join(tmpdir(), 'patchlab-outside-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const cli = fileURLToPath(new URL('../src/cli.ts', import.meta.url));
  const bad = fileURLToPath(new URL('./fixtures/reject-adapter.mjs', import.meta.url));
  const good = fileURLToPath(new URL('./fixtures/good-adapter.mjs', import.meta.url));
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    PATCHLAB_ADAPTER: good,
    PATCHLAB_ALLOW_CHANGED: '1',
  };
  delete env.NODE_TEST_CONTEXT;
  const run = (args: string[]) =>
    spawnSync(process.execPath, args, { cwd, env, encoding: 'utf8', timeout: 15000 });
  const checked = run([cli, 'check-module', bad]);
  assert.ifError(checked.error);
  assert.equal(checked.status, 1, checked.stderr);
  const dirs = readdirSync(join(cwd, 'reports'));
  assert.equal(dirs.length, 1);
  const result = run(['--test', join(cwd, 'reports', dirs[0]!, 'repro.test.ts')]);
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('showcase script runs end-to-end in an isolated working directory without polluting repo reports', (t) => {
  const cwd = mkdtempSync(join(tmpdir(), 'patchlab-showcase-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const showcase = fileURLToPath(new URL('../scripts/showcase.mjs', import.meta.url));
  const env: NodeJS.ProcessEnv = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const result = spawnSync(process.execPath, [showcase], {
    cwd,
    env,
    encoding: 'utf8',
    timeout: 30000,
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /Showcase complete/);
  const dirs = readdirSync(join(cwd, 'reports'));
  assert.equal(dirs.length, 1);
});
