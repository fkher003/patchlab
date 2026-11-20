import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  cpSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  existsSync,
  rmSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { validateExternalReport, renderReport } from '../src/external-report.ts';
import { runBenchmark } from '../src/benchmark.ts';

test('schema 3 external reports replay both contracts, preserve runs, and generate executable regression', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'patchlab-external-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const folder of ['src', 'examples', 'vendor', 'test/fixtures'])
    cpSync(fileURLToPath(new URL(`../${folder}`, import.meta.url)), join(root, folder), {
      recursive: true,
    });
  writeFileSync(join(root, 'package.json'), JSON.stringify({ type: 'module', version: '0.2.0' }));
  const run = (args: string[], vars: Record<string, string> = {}) => {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      PATCHLAB_ADAPTER: '',
      PATCHLAB_ALLOW_CHANGED: '',
      ...vars,
    };
    delete env.NODE_TEST_CONTEXT;
    const result = spawnSync(process.execPath, args, {
      cwd: root,
      env,
      encoding: 'utf8',
      timeout: 15000,
    });
    assert.ifError(result.error);
    return result;
  };
  const cases = [
    {
      command: 'check-module',
      bad: 'test/fixtures/reject-adapter.mjs',
      good: 'test/fixtures/good-adapter.mjs',
      contract: 'refund',
    },
    {
      command: 'check-store',
      bad: 'examples/hono-parent.mjs',
      good: 'examples/hono-fixed.mjs',
      contract: 'lock-store',
    },
  ];
  for (const c of cases) {
    const before = new Set(
      existsSync(join(root, 'reports')) ? readdirSync(join(root, 'reports')) : [],
    );
    const result = run(['src/cli.ts', c.command, c.bad, '42']);
    assert.equal(result.status, 1, result.stderr);
    const added = readdirSync(join(root, 'reports')).filter((d) => !before.has(d));
    assert.equal(added.length, 1);
    const dir = join('reports', added[0]!);
    const reportPath = join(dir, 'failure.json');
    const original = readFileSync(join(root, reportPath), 'utf8');
    const report = validateExternalReport(JSON.parse(original));
    assert.equal(report.schema, 3);
    assert.equal(report.contract, c.contract);
    assert.equal(report.provenance.adapter.scope, 'entry-file-only');
    assert.ok(report.operations.length < report.originalLength);
    assert.equal(run(['src/cli.ts', 'replay-external', reportPath, c.bad]).status, 1);
    assert.equal(run(['src/cli.ts', 'replay-external', reportPath, c.good]).status, 2);
    assert.equal(
      run(['src/cli.ts', 'replay-external', reportPath, c.good, '--allow-changed']).status,
      0,
    );
    assert.equal(run(['src/cli.ts', 'replay-external', reportPath]).status, 2);
    assert.equal(run(['--test', join(dir, 'repro.test.ts')]).status, 1);
    assert.equal(
      run(['--test', join(dir, 'repro.test.ts')], { PATCHLAB_ADAPTER: resolve(root, c.bad) })
        .status,
      1,
    );
    assert.equal(
      run(['--test', join(dir, 'repro.test.ts')], {
        PATCHLAB_ADAPTER: resolve(root, c.good),
        PATCHLAB_ALLOW_CHANGED: '1',
      }).status,
      0,
    );
    assert.equal(run(['src/cli.ts', c.command, c.bad, '42']).status, 1);
    assert.equal(readFileSync(join(root, reportPath), 'utf8'), original);
    assert.ok(existsSync(join(root, dir, 'report.html')));
    // A modified entry file is refused BEFORE it can run top-level code.
    writeFileSync(
      join(root, 'side-effect.mjs'),
      "import { writeFileSync } from 'node:fs'; writeFileSync('executed.txt', 'oops'); export const create = () => ({});",
    );
    assert.equal(run(['src/cli.ts', 'replay-external', reportPath, 'side-effect.mjs']).status, 2);
    assert.equal(existsSync(join(root, 'executed.txt')), false);
    const malformed = [
      { ...report, schema: 4 },
      { ...report, provenance: {} },
      { ...report, seed: -1 },
      { ...report, contract: 'other' },
      { ...report, config: {} },
      { ...report, operations: [{}] },
      { ...report, originalLength: -1 },
    ];
    for (const data of malformed) {
      writeFileSync(join(root, 'invalid.json'), JSON.stringify(data));
      assert.equal(
        run(['src/cli.ts', 'replay-external', 'invalid.json', 'side-effect.mjs', '--allow-changed'])
          .status,
        2,
      );
      assert.equal(existsSync(join(root, 'executed.txt')), false);
    }
    // Report HTML must never turn user strings into markup or scripts.
    const malicious = structuredClone(report);
    malicious.provenance.adapter.name = '<script>alert(1)</script>';
    const html = renderReport(malicious);
    assert.ok(!html.includes('<script>'));
    assert.ok(html.includes('&lt;script&gt;'));
  }
});

test('benchmark timing is finite and nonnegative without changing deterministic counts', async () => {
  const baseline = await runBenchmark(10);
  const measured = await runBenchmark(10, [], true);
  assert.deepEqual(
    measured.map(({ timing: _, ...row }) => row),
    baseline,
  );
  for (const row of measured) {
    assert.ok(row.timing);
    assert.ok(Number.isFinite(row.timing.checkMs) && row.timing.checkMs >= 0);
    assert.ok(Number.isFinite(row.timing.shrinkMs) && row.timing.shrinkMs >= 0);
  }
});
