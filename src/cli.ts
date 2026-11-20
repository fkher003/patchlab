import { cpus, release } from 'node:os';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import { createService } from './refunds.ts';
import type { Request, Variant } from './refunds.ts';
import { check, minimize } from './checker.ts';
import { generate } from './generator.ts';
import { loadAdapter } from './adapter.ts';
import {
  readExternalReport,
  replayExternal,
  hashAdapter,
  loadStoreAdapter,
  writeExternalReport,
} from './external-report.ts';
import { checkStore, generateStoreOps, minimizeStoreOps } from './lockstore.ts';
import type { LockStore } from './lockstore.ts';
import { runBenchmark, toMarkdown } from './benchmark.ts';

function variant(value: string | undefined): Variant {
  if (value !== 'buggy' && value !== 'fixed') throw new Error('Choose buggy or fixed');
  return value;
}
const REPORT_SCHEMA = 2;
function toolVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    return typeof pkg.version === 'string' ? pkg.version : 'unknown';
  } catch {
    return 'unknown';
  }
}
function parseNumberArg(raw: string, label: string): number {
  if (raw.trim() === '') throw new Error(`Invalid ${label}`);
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`Invalid ${label}`);
  return value;
}
function replayData(value: unknown): { paid: number; requests: Request[] } {
  if (!value || typeof value !== 'object') throw new Error('Invalid report');
  const data = value as Record<string, unknown>;
  // Schema 1 (legacy, no provenance) is still replayable; anything else is refused, not guessed.
  if (data.schema !== 1 && data.schema !== REPORT_SCHEMA)
    throw new Error(
      `Unsupported report schema ${String(data.schema)}; expected 1 or ${REPORT_SCHEMA} (use replay-external for schema 3)`,
    );
  if (
    !Number.isSafeInteger(data.paid) ||
    Number(data.paid) < 0 ||
    !Array.isArray(data.requests) ||
    data.requests.length === 0 ||
    data.requests.length > 10000
  )
    throw new Error('Invalid report');
  const requests = data.requests.map((item: unknown) => {
    if (!item || typeof item !== 'object') throw new Error('Invalid request');
    const row = item as Record<string, unknown>;
    if (
      typeof row.id !== 'string' ||
      typeof row.amount !== 'number' ||
      !Number.isFinite(row.amount)
    )
      throw new Error('Invalid request');
    return { id: row.id, amount: row.amount };
  });
  return { paid: Number(data.paid), requests };
}

async function main() {
  const [command, arg, seedArg, extra] = process.argv.slice(2);
  if (process.argv.length > 6) throw new Error('Too many arguments');
  if (extra && !(command === 'replay-external' && extra === '--allow-changed'))
    throw new Error('Unknown option');
  if (command === 'help' || command === '--help' || !command) {
    if (arg !== undefined) throw new Error('Too many arguments');
    console.log(
      'PatchLab: demo | check buggy|fixed [seed] | check-module file [seed] | check-store file [seed] | replay file [variant] | replay-external report trusted-adapter [--allow-changed] | benchmark [n] [--timing]',
    );
    console.log(
      'Exit codes: 0 no violation found; 1 violation found; 2 usage/input error. External modules run with your privileges.',
    );
    return;
  }
  if (command === 'replay-external') {
    if (!arg || !seedArg)
      throw new Error('Usage: replay-external report.json trusted-adapter [--allow-changed]');
    const failure = await replayExternal(
      readExternalReport(arg),
      seedArg,
      extra === '--allow-changed',
    );
    console.log(failure ?? 'PASS for recorded sequence only');
    process.exitCode = failure ? 1 : 0;
    return;
  }
  if (command === 'demo') {
    if (arg !== undefined) throw new Error('Usage: demo');
    const requests = [
      { id: 'request-01', amount: 30000 },
      { id: 'request-01', amount: 30000 },
    ];
    for (const name of ['buggy', 'fixed'] as const) {
      const service = createService(100000, name);
      const failure = check(service, 100000, requests);
      console.log(
        `${name}: ${failure ? 'FAIL ' + failure.rule : 'PASS'}; refunded=${service.total()}`,
      );
    }
    console.log('Demo completed. PASS covers this scenario only.');
    return;
  }
  if (command === 'replay') {
    if (!arg) throw new Error('Usage: npm run replay -- reports/failure.json [buggy|fixed]');
    const data = replayData(JSON.parse(readFileSync(arg, 'utf8')));
    const failure = check(
      createService(data.paid, variant(seedArg ?? 'buggy')),
      data.paid,
      data.requests,
    );
    console.log(failure ?? 'PASS for recorded sequence only');
    process.exitCode = failure ? 1 : 0;
    return;
  }
  if (command === 'check-module') {
    if (!arg) throw new Error('Usage: check-module file.mjs [seed]');
    const adapterFile = resolve(arg);
    const adapterHash = hashAdapter(adapterFile);
    const factory = await loadAdapter(adapterFile);
    const startSeed = seedArg === undefined ? 42 : parseNumberArg(seedArg, 'seed');
    generate(startSeed, 0);
    const paid = 100000;
    for (let trial = 0; trial < 100; trial++) {
      const seed = (startSeed + trial) >>> 0;
      const original = generate(seed);
      const failure = check(factory(paid), paid, original);
      if (!failure) continue;
      const fails = (xs: Request[]) => check(factory(paid), paid, xs)?.rule === failure.rule;
      const requests = minimize(original, fails);
      const reduced = check(factory(paid), paid, requests)!;
      console.log(`FAIL ${failure.rule}; ${original.length} -> ${requests.length} operations`);
      console.log(JSON.stringify(reduced, null, 2));
      console.log(JSON.stringify(requests));
      const paths = writeExternalReport({
        contract: 'refund',
        seed,
        config: { paid },
        operations: requests,
        originalLength: original.length,
        failure: reduced,
        adapter: adapterFile,
        adapterHash,
      });
      console.log(
        `Report: ${paths.reportPath}\nRegression test: ${paths.testPath}\nHTML: ${paths.htmlPath}`,
      );
      process.exitCode = 1;
      return;
    }
    console.log('PASS: 100 sequences x 30 operations on this module. Not a proof.');
    return;
  }
  if (command === 'benchmark') {
    const timingOnly = arg === '--timing' && seedArg === undefined;
    if (!timingOnly && seedArg !== undefined && seedArg !== '--timing')
      throw new Error('Usage: benchmark [n] [--timing]');
    const n = arg === undefined || timingOnly ? 500 : parseNumberArg(arg, 'n');
    const timing = timingOnly || seedArg === '--timing';
    const load = async (file: string) =>
      (
        (await import(new URL(`../examples/${file}`, import.meta.url).href)) as {
          create(o: { maxSize: number }): LockStore;
        }
      ).create;
    const parent = await load('hono-parent.mjs');
    const fixed = await load('hono-fixed.mjs');
    const rows = await runBenchmark(
      n,
      [
        {
          name: 'hono-idempotency memoryStore fixed (28e0f9e)',
          expected: 'correct',
          create: () => fixed({ maxSize: 2 }),
        },
        {
          name: 'hono-idempotency memoryStore parent (dc5c675, issue #89)',
          expected: 'bug',
          create: () => parent({ maxSize: 2 }),
        },
      ],
      timing,
    );
    console.log(toMarkdown(rows));
    if (timing)
      console.log(
        `Environment: Node ${process.version}; ${process.platform}/${process.arch} ${release()}; CPU ${cpus()[0]?.model ?? 'unknown'}; timings include model/check work; no warmup, not a performance guarantee.`,
      );
    process.exitCode = rows.some((r) => (r.expected === 'correct') !== (r.failing === 0)) ? 1 : 0;
    return;
  }
  if (command === 'check-store') {
    if (!arg) throw new Error('Usage: check-store file.mjs [seed]');
    const adapterFile = resolve(arg);
    const adapterHash = hashAdapter(adapterFile);
    const factory = await loadStoreAdapter(adapterFile, 2);
    const startSeed = seedArg === undefined ? 42 : parseNumberArg(seedArg, 'seed');
    generateStoreOps(startSeed, 0);
    for (let trial = 0; trial < 100; trial++) {
      const seed = (startSeed + trial) >>> 0;
      const original = generateStoreOps(seed);
      const failure = await checkStore(factory, original);
      if (!failure) continue;
      const ops = await minimizeStoreOps(
        original,
        async (xs) => (await checkStore(factory, xs))?.rule === failure.rule,
      );
      const reduced = (await checkStore(factory, ops))!;
      console.log(
        `FAIL ${failure.rule}; ${original.length} -> ${ops.length} operations (maxSize=2)`,
      );
      console.log(JSON.stringify(reduced, null, 2));
      console.log(JSON.stringify(ops));
      const paths = writeExternalReport({
        contract: 'lock-store',
        seed,
        config: { maxSize: 2 },
        operations: ops,
        originalLength: original.length,
        failure: reduced,
        adapter: adapterFile,
        adapterHash,
      });
      console.log(
        `Report: ${paths.reportPath}\nRegression test: ${paths.testPath}\nHTML: ${paths.htmlPath}`,
      );
      process.exitCode = 1;
      return;
    }
    console.log('PASS: 100 sequences x 30 operations on this store. Not a proof.');
    return;
  }
  if (command !== 'check')
    throw new Error(
      'Usage: demo | check buggy|fixed [seed] | check-module file [seed] | check-store file [seed] | replay file [variant] | replay-external report trusted-adapter [--allow-changed] | benchmark [n] [--timing]',
    );
  const name = variant(arg);
  const startSeed = seedArg === undefined ? 42 : parseNumberArg(seedArg, 'seed');
  generate(startSeed, 0); // Validate before truncation to uint32.
  const paid = 100000;
  for (let trial = 0; trial < 100; trial++) {
    const seed = (startSeed + trial) >>> 0;
    const original = generate(seed);
    const failure = check(createService(paid, name), paid, original);
    if (!failure) continue;
    // Preserve the original failure category while shrinking.
    const requests = minimize(
      original,
      (xs) => check(createService(paid, name), paid, xs)?.rule === failure.rule,
    );
    const reduced = check(createService(paid, name), paid, requests);
    // One directory per run: a new run can never overwrite an earlier report.
    const createdAt = new Date().toISOString();
    const runId = `${createdAt.replace(/[:.]/g, '-')}-${name}-seed${seed}-${randomBytes(3).toString('hex')}`;
    const runDir = resolve('reports', runId);
    mkdirSync(runDir, { recursive: true });
    const reportPath = resolve(runDir, 'failure.json');
    writeFileSync(
      reportPath,
      JSON.stringify(
        {
          schema: REPORT_SCHEMA,
          synthetic: true,
          provenance: {
            tool: 'patchlab',
            version: toolVersion(),
            runId,
            createdAt,
            source: `builtin:${name}`,
          },
          variant: name,
          seed,
          paid,
          trial,
          originalLength: original.length,
          requests,
          failure: reduced,
        },
        null,
        2,
      ) + '\n',
    );
    const testPath = resolve(runDir, 'repro.test.ts');
    writeFileSync(
      testPath,
      `import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport { createService } from '../../src/refunds.ts';\nimport { check } from '../../src/checker.ts';\n\ntest('recorded regression: ${failure.rule}', () => {\n  const target = process.env.PATCHLAB_TARGET ?? 'fixed';\n  if (target !== 'fixed' && target !== 'buggy') throw new Error('Invalid target');\n  assert.equal(check(createService(${paid}, target), ${paid}, ${JSON.stringify(requests)}), null);\n});\n`,
    );
    console.log(
      `FAIL ${reduced?.rule}; seed=${seed}; ${original.length} -> ${requests.length} operations`,
    );
    console.log(`Report: ${reportPath}\nRegression test: ${testPath}`);
    process.exitCode = 1;
    return;
  }
  console.log(
    'PASS: 100 sequences x 30 operations. No violation found in this bounded run; not a proof.',
  );
}
try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 2;
}
