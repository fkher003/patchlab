import type { Request, Result } from './refunds.ts';

export type ModelStep = { status: Result['status']; total: number };
export type RefundModel = { apply(request: Request): ModelStep };

// Reference model written from docs/SPEC.md. It never imports or calls createService.
// It keeps a ledger of successful refunds (id -> amount) and derives the total from that
// ledger, so "total" is not a second mutable counter that could drift.
export function createModel(paid: number): RefundModel {
  if (!Number.isSafeInteger(paid) || paid < 0) throw new Error('Invalid paid amount');
  const ledger = new Map<string, number>();
  const total = () => [...ledger.values()].reduce((sum, amount) => sum + amount, 0);
  return {
    apply({ id, amount }) {
      const isValid =
        typeof id === 'string' && id.trim() !== '' && Number.isSafeInteger(amount) && amount > 0;
      if (!isValid) return { status: 'invalid', total: total() };
      const earlier = ledger.get(id);
      if (earlier !== undefined)
        return { status: earlier === amount ? 'accepted' : 'conflict', total: total() };
      if (amount > paid - total()) return { status: 'exceeds-balance', total: total() };
      ledger.set(id, amount);
      return { status: 'accepted', total: total() };
    },
  };
}
