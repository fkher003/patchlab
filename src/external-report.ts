import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, mkdtempSync, writeFileSync, statSync } from 'node:fs';
import { basename, relative, resolve, sep, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadAdapter } from './adapter.ts';
import { check } from './checker.ts';
import type { Failure } from './checker.ts';
import type { Request } from './refunds.ts';
import { checkStore } from './lockstore.ts';
import type { StoreFailure, StoreOp, StoreFactory, LockStore } from './lockstore.ts';

export type ExternalReport = {
  schema: 3;
  contract: 'refund' | 'lock-store';
  seed: number;
  config: { paid: number } | { maxSize: number };
  operations: Request[] | StoreOp[];
  originalLength: number;
  failure: { rule: string };
  provenance: {
    tool: 'patchlab';
    version: string;
    createdAt: string;
    runId: string;
    adapter: { name: string; sha256: string; scope: 'entry-file-only' };
  };
};

export const hashAdapter = (file: string): string =>
  createHash('sha256').update(readFileSync(file)).digest('hex');
export function toolVersion(): string {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  return typeof pkg.version === 'string' ? pkg.version : 'unknown';
}
const record = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);
const integer = (x: unknown, min: number, max: number): x is number =>
  typeof x === 'number' && Number.isSafeInteger(x) && x >= min && x <= max;

// Validation precedes any adapter import. Reports describe data; they never choose executable code.
export function validateExternalReport(value: unknown): ExternalReport {
  if (!record(value) || value.schema !== 3) throw new Error('Expected external report schema 3');
  const d = value;
  if (d.contract !== 'refund' && d.contract !== 'lock-store') throw new Error('Unknown contract');
  if (
    !integer(d.seed, 0, 0xffffffff) ||
    !record(d.config) ||
    !Array.isArray(d.operations) ||
    d.operations.length === 0 ||
    d.operations.length > 10000 ||
    !integer(d.originalLength, d.operations.length, 10000) ||
    !record(d.failure) ||
    typeof d.failure.rule !== 'string' ||
    !d.failure.rule
  )
    throw new Error('Invalid external report data');
  const p = d.provenance;
  if (
    !record(p) ||
    p.tool !== 'patchlab' ||
    typeof p.version !== 'string' ||
    !p.version ||
    typeof p.runId !== 'string' ||
    !p.runId ||
    typeof p.createdAt !== 'string' ||
    !Number.isFinite(Date.parse(p.createdAt)) ||
    !record(p.adapter) ||
    typeof p.adapter.name !== 'string' ||
    !p.adapter.name ||
    typeof p.adapter.sha256 !== 'string' ||
    !/^[a-f0-9]{64}$/.test(p.adapter.sha256) ||
    p.adapter.scope !== 'entry-file-only'
  )
    throw new Error('Invalid report provenance');
  if (d.contract === 'refund') {
    if (!integer(d.config.paid, 0, Number.MAX_SAFE_INTEGER)) throw new Error('Invalid paid amount');
    for (const op of d.operations)
      if (
        !record(op) ||
        typeof op.id !== 'string' ||
        typeof op.amount !== 'number' ||
        !Number.isFinite(op.amount)
      )
        throw new Error('Invalid refund operation');
  } else {
    if (!integer(d.config.maxSize, 1, 100000)) throw new Error('Invalid maxSize');
    for (const op of d.operations)
      if (
        !record(op) ||
        typeof op.key !== 'string' ||
        typeof op.op !== 'string' ||
        !['lock', 'get', 'complete', 'delete'].includes(op.op)
      )
        throw new Error('Invalid store operation');
  }
  return value as ExternalReport;
}
export function readExternalReport(file: string): ExternalReport {
  if (statSync(file).size > 5_000_000) throw new Error('Report exceeds 5 MB limit');
  return validateExternalReport(JSON.parse(readFileSync(file, 'utf8')));
}

export async function loadStoreAdapter(file: string, maxSize: number): Promise<StoreFactory> {
  const mod: unknown = await import(pathToFileURL(resolve(file)).href);
  if (!record(mod) || typeof mod.create !== 'function')
    throw new Error('Adapter must export function create(options)');
  const create = mod.create;
  const make = async (): Promise<LockStore> => {
    const s: unknown = await create({ maxSize });
    if (
      !record(s) ||
      !['get', 'lock', 'complete', 'delete'].every((k) => typeof s[k] === 'function')
    )
      throw new Error('Invalid lock-store contract');
    return s as LockStore;
  };
  await make();
  return make;
}

export async function replayExternal(
  report: ExternalReport,
  adapter: string,
  allowChanged = false,
): Promise<Failure | StoreFailure | null> {
  const data = validateExternalReport(report);
  const file = resolve(adapter);
  if (hashAdapter(file) !== data.provenance.adapter.sha256 && !allowChanged)
    throw new Error(
      'Adapter hash differs; use --allow-changed only to intentionally compare a new version',
    );
  if (data.contract === 'refund') {
    const paid = (data.config as { paid: number }).paid;
    const create = await loadAdapter(file);
    return check(create(paid), paid, data.operations as Request[]);
  }
  const create = await loadStoreAdapter(file, (data.config as { maxSize: number }).maxSize);
  return checkStore(create, data.operations as StoreOp[]);
}

const escapeHtml = (x: unknown) =>
  String(x).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
export function renderReport(report: ExternalReport): string {
  const r = validateExternalReport(report);
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>PatchLab failure report</title><style>body{font:16px system-ui;max-width:900px;margin:48px auto;padding:0 24px;background:#101820;color:#ecf2f8}h1{font-size:36px}p{line-height:1.6}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#1c2936;padding:24px;border-radius:12px}.badge{color:#ffb1a8}small{color:#abb9c8}</style><small>PATCHLAB / REPRODUCIBLE EVIDENCE</small><h1 class="badge">FAIL: ${escapeHtml(r.failure.rule)}</h1><p>Contract: <b>${escapeHtml(r.contract)}</b> · Seed: ${r.seed} · Config: <code>${escapeHtml(JSON.stringify(r.config))}</code><br>Operations reduced: <b>${r.originalLength} → ${r.operations.length}</b></p><h2>Observed failure</h2><pre>${escapeHtml(JSON.stringify(r.failure, null, 2))}</pre><h2>Reduced sequence</h2><pre>${escapeHtml(JSON.stringify(r.operations, null, 2))}</pre><h2>Source evidence</h2><pre>${escapeHtml(JSON.stringify(r.provenance, null, 2))}</pre><p>Hash covers the adapter entry file only, not imported dependencies. A passing replay does not prove universal correctness. This report contains no executable adapter and no tracking scripts.</p></html>`;
}

export function writeExternalReport(input: {
  contract: ExternalReport['contract'];
  seed: number;
  config: ExternalReport['config'];
  operations: Request[] | StoreOp[];
  originalLength: number;
  failure: { rule: string };
  adapter: string;
  adapterHash: string;
}): { reportPath: string; testPath: string; htmlPath: string } {
  // Refuse to attribute findings to a source that changed while it was being checked.
  if (hashAdapter(input.adapter) !== input.adapterHash)
    throw new Error('Adapter changed during run');
  const reports = resolve('reports');
  mkdirSync(reports, { recursive: true });
  const dir = mkdtempSync(resolve(reports, `${input.contract}-seed${input.seed}-`));
  const report: ExternalReport = {
    schema: 3,
    contract: input.contract,
    seed: input.seed,
    config: input.config,
    operations: input.operations,
    originalLength: input.originalLength,
    failure: input.failure,
    provenance: {
      tool: 'patchlab',
      version: toolVersion(),
      createdAt: new Date().toISOString(),
      runId: basename(dir),
      adapter: {
        name: basename(input.adapter),
        sha256: input.adapterHash,
        scope: 'entry-file-only',
      },
    },
  };
  validateExternalReport(report);
  const reportPath = resolve(dir, 'failure.json');
  const testPath = resolve(dir, 'repro.test.ts');
  const htmlPath = resolve(dir, 'report.html');
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  const modulePath = relative(dir, fileURLToPath(import.meta.url))
    .split(sep)
    .join('/');
  const importPath = isAbsolute(modulePath)
    ? import.meta.url
    : modulePath.startsWith('.')
      ? modulePath
      : './' + modulePath;
  writeFileSync(
    testPath,
    `import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport { fileURLToPath } from 'node:url';\nimport { readExternalReport, replayExternal } from ${JSON.stringify(importPath)};\n\ntest('external regression', async () => {\n  const adapter = process.env.PATCHLAB_ADAPTER;\n  assert.ok(adapter, 'Set PATCHLAB_ADAPTER explicitly to trusted module path');\n  const report = readExternalReport(fileURLToPath(new URL('./failure.json', import.meta.url)));\n  const failure = await replayExternal(report, adapter, process.env.PATCHLAB_ALLOW_CHANGED === '1');\n  assert.equal(failure, null, JSON.stringify(failure));\n});\n`,
  );
  writeFileSync(htmlPath, renderReport(report));
  return { reportPath, testPath, htmlPath };
}
