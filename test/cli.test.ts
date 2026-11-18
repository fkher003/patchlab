import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, cpSync, readFileSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

test('CLI detects, replays and exports a real executable regression', () => {
  const root = mkdtempSync(join(tmpdir(), 'patchlab-cli-'));
  try {
    cpSync(fileURLToPath(new URL('../src/', import.meta.url)), join(root, 'src'), {
      recursive: true,
    });
    writeFileSync(join(root, 'package.json'), '{"type":"module"}');
    const run = (args: string[], target = 'fixed') => {
      // Nested test processes must start as independent runners.
      const childEnv: NodeJS.ProcessEnv = { ...process.env, PATCHLAB_TARGET: target };
      delete childEnv.NODE_TEST_CONTEXT;
      const result = spawnSync(process.execPath, args, {
        cwd: root,
        encoding: 'utf8',
        timeout: 15000,
        env: childEnv,
      });
      assert.ifError(result.error);
      return result;
    };
    assert.equal(run(['src/cli.ts', 'demo']).status, 0);
    assert.equal(run(['src/cli.ts', 'check', 'buggy', '42']).status, 1);
    const runs = () => readdirSync(join(root, 'reports'));
    assert.equal(runs().length, 1);
    const dir = `reports/${runs()[0]}`;
    const report = JSON.parse(readFileSync(join(root, dir, 'failure.json'), 'utf8'));
    assert.equal(report.schema, 2);
    assert.equal(report.provenance.source, 'builtin:buggy');
    assert.ok(dir.includes(report.provenance.runId));
    assert.equal(report.seed, 42);
    assert.ok(report.requests.length < report.originalLength);
    assert.equal(run(['src/cli.ts', 'replay', `${dir}/failure.json`, 'buggy']).status, 1);
    assert.equal(run(['src/cli.ts', 'replay', `${dir}/failure.json`, 'fixed']).status, 0);
    assert.equal(run(['--test', `${dir}/repro.test.ts`], 'buggy').status, 1);
    assert.equal(run(['--test', `${dir}/repro.test.ts`], 'fixed').status, 0);
    assert.equal(run(['src/cli.ts', 'check', 'fixed']).status, 0);
    assert.equal(run(['src/cli.ts', 'check', 'buggy', '-1']).status, 2);
    assert.equal(run(['src/cli.ts', 'check', 'unknown']).status, 2);
    writeFileSync(join(root, 'invalid.json'), '{');
    assert.equal(run(['src/cli.ts', 'replay', 'invalid.json']).status, 2);
    writeFileSync(join(root, 'invalid.json'), JSON.stringify({ paid: 1, requests: [{ id: 1 }] }));
    assert.equal(run(['src/cli.ts', 'replay', 'invalid.json']).status, 2);
    // A second failing run gets its own directory; the first report is untouched.
    const first = readFileSync(join(root, dir, 'failure.json'), 'utf8');
    assert.equal(run(['src/cli.ts', 'check', 'buggy', '42']).status, 1);
    assert.equal(runs().length, 2);
    assert.equal(readFileSync(join(root, dir, 'failure.json'), 'utf8'), first);
    // Unknown or missing schema versions are refused (exit 2), legacy schema 1 still replays.
    const good = { paid: 100000, requests: report.requests };
    for (const schema of [undefined, 3, 'x']) {
      writeFileSync(join(root, 'v.json'), JSON.stringify({ ...good, schema }));
      assert.equal(run(['src/cli.ts', 'replay', 'v.json']).status, 2);
    }
    writeFileSync(join(root, 'v.json'), JSON.stringify({ ...good, schema: 1 }));
    assert.equal(run(['src/cli.ts', 'replay', 'v.json', 'buggy']).status, 1);
  } finally {
    // Only the freshly created task-owned temporary directory is removed.
    rmSync(root, { recursive: true, force: true });
  }
});
