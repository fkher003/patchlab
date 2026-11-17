import test from 'node:test';
import assert from 'node:assert/strict';
import { createService } from '../src/refunds.ts';
import { check, minimize } from '../src/checker.ts';
import { generate } from '../src/generator.ts';

test('a normal one-off refund cannot distinguish buggy from fixed', () => {
  for (const variant of ['buggy', 'fixed'] as const) {
    const service = createService(100000, variant);
    assert.equal(service.refund({ id: 'a', amount: 30000 }).status, 'accepted');
    assert.equal(service.total(), 30000);
  }
});
test('retry must not spend remaining balance twice', () => {
  const requests = [
    { id: 'a', amount: 30000 },
    { id: 'a', amount: 30000 },
  ];
  assert.equal(
    check(createService(100000, 'buggy'), 100000, requests)?.rule,
    'successful-retry-changed-result',
  );
  assert.equal(check(createService(100000, 'fixed'), 100000, requests), null);
});
test('successful retry remains successful after balance is exhausted', () => {
  const service = createService(100000, 'fixed');
  service.refund({ id: 'a', amount: 100000 });
  assert.equal(service.refund({ id: 'a', amount: 100000 }).status, 'accepted');
  assert.equal(service.total(), 100000);
});
test('same id with a different amount conflicts without mutation', () => {
  const service = createService(100000, 'fixed');
  service.refund({ id: 'a', amount: 30000 });
  assert.equal(service.refund({ id: 'a', amount: 40000 }).status, 'conflict');
  assert.equal(service.total(), 30000);
});
test('invalid values and excessive refund leave state intact', () => {
  const service = createService(100000, 'fixed');
  for (const amount of [-1, 0, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(service.refund({ id: 'a', amount }).status, 'invalid');
    assert.equal(service.total(), 0);
  }
  assert.equal(service.refund({ id: ' ', amount: 1 }).status, 'invalid');
  assert.equal(service.refund({ id: 'a', amount: 100001 }).status, 'exceeds-balance');
  assert.equal(service.total(), 0);
  assert.equal(service.refund({ id: 'a', amount: 1 }).status, 'accepted');
});
test('checker detects rejected state changes and unrecorded accepted amounts', () => {
  let total = 0;
  assert.equal(
    check(
      {
        total: () => total,
        refund: () => {
          total += 1;
          return { status: 'conflict' };
        },
      },
      100,
      [{ id: 'a', amount: 1 }],
    )?.rule,
    'rejected-request-mutated-state',
  );
  assert.equal(
    check({ total: () => 0, refund: () => ({ status: 'accepted' }) }, 100, [{ id: 'a', amount: 1 }])
      ?.rule,
    'accepted-amount-not-recorded',
  );
});
test('generator is reproducible and catches the intentionally buggy variant', () => {
  assert.deepEqual(generate(42), generate(42));
  let detected = false;
  for (let seed = 42; seed < 142; seed++) {
    const requests = generate(seed);
    assert.equal(check(createService(100000, 'fixed'), 100000, requests), null);
    detected ||= check(createService(100000, 'buggy'), 100000, requests) !== null;
  }
  assert.equal(detected, true);
});
test('minimizer preserves failure and reaches single-deletion minimality', () => {
  const xs = [
    { id: 'unused', amount: -1 },
    { id: 'a', amount: 30000 },
    { id: 'a', amount: 30000 },
    { id: 'other', amount: 1 },
  ];
  const fails = (items: typeof xs) =>
    check(createService(100000, 'buggy'), 100000, items)?.rule ===
    'successful-retry-changed-result';
  const small = minimize(xs, fails);
  assert.equal(small.length, 2);
  assert.equal(fails(small), true);
  small.forEach((_, i) => assert.equal(fails(small.filter((_, j) => j !== i)), false));
  assert.throws(() => minimize([], fails));
});
