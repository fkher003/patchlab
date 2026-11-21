import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const cli = resolve(root, 'src/cli.ts');
const parent = resolve(root, 'examples/hono-parent.mjs');
const fixed = resolve(root, 'examples/hono-fixed.mjs');
function run(args, expected, vars = {}) {
  const env = { ...process.env, ...vars };
  delete env.NODE_TEST_CONTEXT;
  const result = spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    env,
    encoding: 'utf8',
    timeout: 30000,
  });
  if (result.error) throw result.error;
  process.stdout.write(result.stdout);
  if (result.status !== expected)
    throw new Error('Unexpected exit code: ' + result.status + '\n' + result.stderr);
  return result.stdout;
}
console.log('1/4 Find and minimize the upstream store failure');
const output = run([cli, 'check-store', parent], 1);
const report = output.match(/^Report: (.+)$/m)?.[1]?.trim();
if (!report) throw new Error('Missing report path');
console.log('2/4 Replay the exact recorded sequence on the original adapter');
run([cli, 'replay-external', report, parent], 1);
console.log('3/4 Compare the fixed adapter (intentional source change)');
run([cli, 'replay-external', report, fixed, '--allow-changed'], 0);
console.log('4/4 Run the exported regression test against the fixed adapter');
run(['--test', resolve(dirname(report), 'repro.test.ts')], 0, {
  PATCHLAB_ADAPTER: fixed,
  PATCHLAB_ALLOW_CHANGED: '1',
});
console.log(
  'Showcase complete. Open the report.html file printed above. Reports have been preserved.',
);
