import test from 'node:test';
import assert from 'node:assert/strict';
import { createService } from '../src/refunds.ts';
import type { Request, Service } from '../src/refunds.ts';
import { check } from '../src/checker.ts';
import { createModel } from '../src/model.ts';
import { generate } from '../src/generator.ts';

// Always rejects, never touches state: satisfies every "must not happen" property.
const alwaysReject: Service = {
  total: () => 0,
  refund: () => ({ status: 'exceeds-balance' }),
};

test('model: spec cases for accept, retry, conflict, invalid and balance', () => {
  const model = createModel(100);
  assert.deepEqual(model.apply({ id: 'a', amount: 60 }), { status: 'accepted', total: 60 });
  assert.deepEqual(model.apply({ id: 'a', amount: 60 }), { status: 'accepted', total: 60 });
  assert.deepEqual(model.apply({ id: 'a', amount: 70 }), { status: 'conflict', total: 60 });
  assert.deepEqual(model.apply({ id: 'b', amount: 41 }), { status: 'exceeds-balance', total: 60 });
  assert.deepEqual(model.apply({ id: ' ', amount: 1 }), { status: 'invalid', total: 60 });
  // a rejected id does not occupy the id (SPEC): it can succeed later with another amount
  assert.deepEqual(model.apply({ id: 'b', amount: 40 }), { status: 'accepted', total: 100 });
  // exhausted balance does not break a successful retry
  assert.deepEqual(model.apply({ id: 'b', amount: 40 }), { status: 'accepted', total: 100 });
  assert.throws(() => createModel(-1));
});

test('always-reject service is caught by the reference model', () => {
  const failure = check(alwaysReject, 100000, [{ id: 'a', amount: 1 }]);
  assert.equal(failure?.rule, 'model-status-mismatch');
  assert.equal(failure?.step, 0);
});

test('a rejected id must not occupy the id (SPEC choice) - only the model can tell', () => {
  const seen = new Set<string>();
  let total = 0;
  const rejectedIdsStick: Service = {
    total: () => total,
    refund: ({ id, amount }) => {
      if (seen.has(id)) return { status: 'conflict' };
      seen.add(id);
      if (amount > 100 - total) return { status: 'exceeds-balance' };
      total += amount;
      return { status: 'accepted' };
    },
  };
  const failure = check(rejectedIdsStick, 100, [
    { id: 'b', amount: 101 },
    { id: 'b', amount: 50 },
  ]);
  assert.equal(failure?.rule, 'model-status-mismatch');
  assert.equal(failure?.step, 1);
});
test('checker reports a total that differs from the model even when status matches', () => {
  let total = 0;
  const underRecords: Service = {
    total: () => total,
    refund: ({ amount }) => {
      total += amount;
      return { status: 'accepted' };
    },
  };
  // 'exceeds-balance' expected for the 2nd request, service accepts: status mismatch, not total
  assert.equal(
    check(underRecords, 100, [
      { id: 'a', amount: 60 },
      { id: 'b', amount: 60 },
    ])?.rule,
    'balance-out-of-bounds',
  );
  let drift = 0;
  const rejectsValidAfterFirst: Service = {
    total: () => drift,
    refund: () => ({ status: 'exceeds-balance' }),
  };
  assert.equal(
    check(rejectsValidAfterFirst, 100, [{ id: 'a', amount: 5 }])?.rule,
    'model-status-mismatch',
  );
});

test('fixed service agrees with the model on retry, conflict, invalid and exhausted balance', () => {
  const requests: Request[] = [
    { id: 'a', amount: 100000 },
    { id: 'a', amount: 100000 },
    { id: 'a', amount: 1 },
    { id: 'b', amount: 1 },
    { id: 'c', amount: -1 },
    { id: ' ', amount: 1 },
  ];
  assert.equal(check(createService(100000, 'fixed'), 100000, requests), null);
  for (let seed = 0; seed < 200; seed++)
    assert.equal(check(createService(100000, 'fixed'), 100000, generate(seed)), null);
});
