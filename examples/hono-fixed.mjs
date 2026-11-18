// Adapter for the UPSTREAM store after the fix (commit 28e0f9e, PR #98).
import { memoryStore } from '../vendor/hono-idempotency/memory.fixed.ts';
export const create = ({ maxSize }) => memoryStore({ maxSize });
