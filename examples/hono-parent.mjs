// Adapter for the UPSTREAM store at the parent of the fix commit (contains the bug).
// Source: https://github.com/paveg/hono-idempotency (MIT) issue #89, parent dc5c675.
import { memoryStore } from '../vendor/hono-idempotency/memory.parent.ts';
export const create = ({ maxSize }) => memoryStore({ maxSize });
