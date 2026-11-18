// Test adapter: always rejects valid requests.
export const create = () => ({ total: () => 0, refund: () => ({ status: 'exceeds-balance' }) });
