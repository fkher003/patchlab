export type Request = { id: string; amount: number };
export type Result = { status: 'accepted' | 'invalid' | 'conflict' | 'exceeds-balance' };
export type Service = {
  refund(request: Request): Result;
  total(): number;
};
export type Variant = 'buggy' | 'fixed';

// This service deliberately models sequential, in-memory operations only.
export function createService(paid: number, variant: Variant): Service {
  if (!Number.isSafeInteger(paid) || paid < 0) throw new Error('Invalid paid amount');
  let refunded = 0;
  const accepted = new Map<string, number>();
  return {
    total: () => refunded,
    refund(request) {
      const { id, amount } = request;
      if (typeof id !== 'string' || id.trim() === '' ||
          !Number.isSafeInteger(amount) || amount <= 0) return { status: 'invalid' };

      // Intentional defect: buggy variant forgets to recognize successful retries.
      if (variant === 'fixed' && accepted.has(id)) {
        return { status: accepted.get(id) === amount ? 'accepted' : 'conflict' };
      }
      if (amount > paid - refunded) return { status: 'exceeds-balance' };
      refunded += amount;
      accepted.set(id, amount);
      return { status: 'accepted' };
    },
  };
}
