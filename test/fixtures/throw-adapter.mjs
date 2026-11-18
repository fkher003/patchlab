// Test adapter: breaks the contract (throws, then bad status shapes are tested elsewhere).
export const create = () => ({
  total: () => 0,
  refund: () => {
    throw new Error('boom');
  },
});
