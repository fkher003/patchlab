import type { Request, Service } from './refunds.ts';
import { createModel } from './model.ts';

export type Failure = {
  rule:
    | 'rejected-request-mutated-state'
    | 'successful-retry-changed-result'
    | 'id-reused-with-different-amount'
    | 'invalid-amount-accepted'
    | 'balance-out-of-bounds'
    | 'accepted-amount-not-recorded'
    | 'model-status-mismatch'
    | 'model-total-mismatch';
  step: number;
  request: Request;
  before: number;
  after: number;
  status: string;
};

// An observer of externally visible behavior; it does not read the service's Map.
export function check(service: Service, paid: number, requests: Request[]): Failure | null {
  const successes = new Map<string, number>();
  const model = createModel(paid);
  for (const [step, request] of requests.entries()) {
    const before = service.total();
    const result = service.refund({ ...request });
    const after = service.total();
    const expected = model.apply(request);
    const fail = (rule: Failure['rule']): Failure => ({
      rule,
      step,
      request,
      before,
      after,
      status: result.status,
    });
    const property = (): Failure | null => {
      if (!Number.isSafeInteger(after) || after < 0 || after > paid)
        return fail('balance-out-of-bounds');
      if (result.status !== 'accepted' && before !== after)
        return fail('rejected-request-mutated-state');
      const valid =
        typeof request.id === 'string' &&
        request.id.trim() !== '' &&
        Number.isSafeInteger(request.amount) &&
        request.amount > 0;
      if (!valid) {
        if (result.status !== 'invalid') return fail('invalid-amount-accepted');
        return null;
      }
      if (successes.has(request.id)) {
        if (successes.get(request.id) !== request.amount) {
          if (result.status !== 'conflict' || before !== after)
            return fail('id-reused-with-different-amount');
        } else if (result.status !== 'accepted' || before !== after) {
          return fail('successful-retry-changed-result');
        }
      } else if (result.status === 'accepted') {
        if (after - before !== request.amount) return fail('accepted-amount-not-recorded');
        successes.set(request.id, request.amount);
      }
      return null;
    };
    const broken = property();
    if (broken) return broken;
    // Property rules only say what must not happen; the model also says what must be accepted.
    if (result.status !== expected.status) return fail('model-status-mismatch');
    if (after !== expected.total) return fail('model-total-mismatch');
  }
  return null;
}

// Greedy deletion: 1-minimal by deleting one operation, NOT a global minimum.
export function minimize(requests: Request[], fails: (xs: Request[]) => boolean): Request[] {
  if (!fails(requests)) throw new Error('Cannot minimize a passing sequence');
  let result = requests.slice();
  let index = 0;
  while (index < result.length) {
    const candidate = result.filter((_, i) => i !== index);
    if (fails(candidate)) {
      result = candidate;
      index = 0;
    } else index++;
  }
  return result;
}
