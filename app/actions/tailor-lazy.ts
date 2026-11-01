// app/actions/tailor-lazy.ts
// Safe entry point for pages. It has no heavy imports at the top, so a plain
// /biotech or /fintech visit can never fail because of the tailoring stack
// (Playwright, AI SDK). The stack is loaded only when a job link is present,
// and any failure returns the regular page.

import type { Content } from '../biotech/content';

export async function tailorIfRequested(base: Content, jobUrl: string, scope: string): Promise<Content> {
  try {
    const { tailorContent } = await import('./tailor-page');
    return await tailorContent(base, jobUrl, scope);
  } catch (err) {
    console.error('[tailor] unavailable:', err instanceof Error ? err.message : err);
    return base;
  }
}