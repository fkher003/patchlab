import test from 'node:test';
import assert from 'node:assert/strict';
import { checkStore, generateStoreOps } from '../src/lockstore.ts';
import type { LockStore, StoreOp } from '../src/lockstore.ts';

const stub = (): LockStore => ({
  lock: async () => true,
  get: async () => ({ status: 'processing' }),
  complete: async () => {},
  delete: async () => {},
});
test('store checker rejects non-boolean locks and malformed records from external JavaScript', async () => {
  const lock: StoreOp = { op: 'lock', key: 'a' };
  const get: StoreOp = { op: 'get', key: 'a' };
  for (const result of [1, 'yes', null, undefined]) {
    const service = { ...stub(), lock: async () => result };
    assert.equal(
      (await checkStore(() => service as unknown as LockStore, [lock]))?.rule,
      'store-contract-violation',
    );
  }
  for (const result of [0, false, null, 'processing', {}]) {
    const service = { ...stub(), get: async () => result };
    assert.equal(
      (await checkStore(() => service as unknown as LockStore, [get]))?.rule,
      'store-contract-violation',
    );
  }
});
test('processing record cannot silently become completed', async () => {
  const service: LockStore = { ...stub(), get: async () => ({ status: 'completed' }) };
  assert.equal(
    (
      await checkStore(
        () => service,
        [
          { op: 'lock', key: 'a' },
          { op: 'get', key: 'a' },
        ],
      )
    )?.rule,
    'processing-state-changed',
  );
});
test('store generator rejects unsafe work budgets', () => {
  for (const count of [-1, 1.5, Infinity, NaN, 10001])
    assert.throws(() => generateStoreOps(42, count));
  assert.deepEqual(generateStoreOps(42, 0), []);
});
