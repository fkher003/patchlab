import { pathToFileURL } from 'node:url';
import type { Service } from './refunds.ts';

export type ServiceFactory = (paid: number) => Service;

// Adapter contract (docs/SPEC.md "Adapter"): an ES module exporting
//   export function create(paid: number): Service   // fresh instance each call
// Service = { refund({id, amount}): {status}, total(): number }. Sequential, synchronous.
// Importing runs the module's code with your privileges: only load code you trust.
export async function loadAdapter(file: string): Promise<ServiceFactory> {
  const mod: unknown = await import(pathToFileURL(file).href);
  const create = (mod as { create?: unknown } | null)?.create;
  if (typeof create !== 'function') throw new Error('Adapter must export function create(paid)');
  return (paid) => {
    const service: unknown = create(paid);
    const s = service as Partial<Service> | null;
    if (!s || typeof s.refund !== 'function' || typeof s.total !== 'function')
      throw new Error('create(paid) must return { refund, total } functions');
    return s as Service;
  };
}
