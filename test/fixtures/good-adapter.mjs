// Test adapter: a correct, independently written implementation.
export function create(paid) {
  const done = new Map();
  let total = 0;
  return {
    total: () => total,
    refund({ id, amount }) {
      if (
        typeof id !== 'string' ||
        id.trim() === '' ||
        !Number.isSafeInteger(amount) ||
        amount <= 0
      )
        return { status: 'invalid' };
      if (done.has(id)) return { status: done.get(id) === amount ? 'accepted' : 'conflict' };
      if (amount > paid - total) return { status: 'exceeds-balance' };
      done.set(id, amount);
      total += amount;
      return { status: 'accepted' };
    },
  };
}
