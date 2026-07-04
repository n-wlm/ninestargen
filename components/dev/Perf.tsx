'use client';

// TEMPORARY performance-audit harness — removed in the final cleanup phase.
// Wrap a region in <PerfRegion id="…"> to accumulate its React commit count and
// actual render time into window.__nsgPerf. Reset with window.__nsgResetPerf().
import { Profiler, type ReactNode } from 'react';

type Entry = { commits: number; actual: number; base: number };
type Store = Record<string, Entry>;

declare global {
  interface Window {
    __nsgPerf?: Store;
    __nsgResetPerf?: () => void;
  }
}

if (typeof window !== 'undefined') {
  window.__nsgPerf ??= {};
  window.__nsgResetPerf = () => { window.__nsgPerf = {}; };
}

function onRender(id: string, _phase: unknown, actual: number, base: number) {
  if (typeof window === 'undefined') return;
  const store = (window.__nsgPerf ??= {});
  const e = (store[id] ??= { commits: 0, actual: 0, base: 0 });
  e.commits += 1;
  e.actual += actual;
  e.base += base;
}

export function PerfRegion({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
}
