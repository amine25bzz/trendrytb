import { lazy, Suspense } from 'react';

/** Loaded only on demand; absent from builds without VITE_SPECIMEN=1 (see vite.config.ts). */
const Specimen = __SPECIMEN_ENABLED__ ? lazy(() => import('./specimen/Specimen')) : null;

export const SPECIMEN_PATH = '/_specimen';

/** P00/P01 placeholder. Replaced by the router and app shell in P05. */
export function App() {
  if (Specimen && window.location.pathname === SPECIMEN_PATH) {
    return (
      <Suspense fallback={null}>
        <Specimen />
      </Suspense>
    );
  }
  return (
    <main>
      <h1>TrendRadar</h1>
      <p>Front-end foundation is in place. No features yet.</p>
    </main>
  );
}
