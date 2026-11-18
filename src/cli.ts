import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createService } from './refunds.ts';
import type { Request, Variant } from './refunds.ts';
import { check, minimize } from './checker.ts';
import { generate } from './generator.ts';
import { loadAdapter } from './adapter.ts';

function variant(value: string | undefined): Variant {
  if (value !== 'buggy' && value !== 'fixed') throw new Error('Choose buggy or fixed');
  return value;
}
function replayData(value: unknown): { paid: number; requests: Request[] } {
  if (!value || typeof value !== 'object') throw new Error('Invalid report');
  const data = value as Record<string, unknown>;
  if (
    !Number.isSafeInteger(data.paid) ||
    Number(data.paid) < 0 ||
    !Array.isArray(data.requests) ||
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
  const [command, arg, seedArg] = process.argv.slice(2);
  if (command === 'demo') {
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
    const factory = await loadAdapter(resolve(arg));
    const startSeed = seedArg === undefined ? 42 : Number(seedArg);
    generate(startSeed, 0);
    const paid = 100000;
    for (let trial = 0; trial < 100; trial++) {
      const original = generate((startSeed + trial) >>> 0);
      const failure = check(factory(paid), paid, original);
      if (!failure) continue;
      const fails = (xs: Request[]) => check(factory(paid), paid, xs)?.rule === failure.rule;
      const requests = minimize(original, fails);
      console.log(`FAIL ${failure.rule}; ${original.length} -> ${requests.length} operations`);
      console.log(JSON.stringify(check(factory(paid), paid, requests), null, 2));
      console.log(JSON.stringify(requests));
      process.exitCode = 1;
      return;
    }
    console.log('PASS: 100 sequences x 30 operations on this module. Not a proof.');
    return;
  }
  if (command !== 'check')
    throw new Error(
      'Usage: demo | check buggy|fixed [seed] | check-module file [seed] | replay file [variant]',
    );
  const name = variant(arg);
  const startSeed = seedArg === undefined ? 42 : Number(seedArg);
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
    const reportPath = resolve('reports/failure.json');
    mkdirSync(dirname(reportPath), { recursive: true });
    writeFileSync(
      reportPath,
      JSON.stringify(
        {
          schema: 1,
          synthetic: true,
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
    const testPath = resolve('reports/repro.test.ts');
    writeFileSync(
      testPath,
      `import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport { createService } from '../src/refunds.ts';\nimport { check } from '../src/checker.ts';\n\ntest('recorded regression: ${failure.rule}', () => {\n  const target = process.env.PATCHLAB_TARGET ?? 'fixed';\n  if (target !== 'fixed' && target !== 'buggy') throw new Error('Invalid target');\n  assert.equal(check(createService(${paid}, target), ${paid}, ${JSON.stringify(requests)}), null);\n});\n`,
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
