import type { Metadata } from "next";
import SignalField from "./signalfield";
import NeuralField from "./neuralfield";
import PortfolioView from "./portfolioview";
import { content } from "./content";
import { applyLens, resolveLens } from "./tailor";
import { tailorIfRequested } from "../actions/tailor-lazy";
import { first, jobUrlFromParams } from "./joburl";

// Tailoring scrapes a job page and calls a model; allow time on hosts that cap it.
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Software for biotech",
  description:
    "Computer science student building ML models and data pipelines for neural and clinical data: projects, current work, and contact.",
};

export default async function BiotechPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const base = applyLens(content, resolveLens(first(sp.for)));

  // /biotech?v=<job url> tailors the page; any failure falls back to `base`.
  const jobUrl = jobUrlFromParams(sp);
  const c = jobUrl ? await tailorIfRequested(base, jobUrl, "biotech") : base;

  return (
    <PortfolioView
      c={c}
      motion={first(sp.motion)}
      field={<SignalField />}
      background={<NeuralField />}
    />
  );
}