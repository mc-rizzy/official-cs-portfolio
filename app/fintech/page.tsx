import type { Metadata } from "next";
import "./fintech.css";
import MarketField from "./marketfield";
import ChartField from "./chartfield";
import PortfolioView from "../biotech/portfolioview";
import { content } from "./content";
import { tailorIfRequested } from "../actions/tailor-lazy";
import { first, jobUrlFromParams } from "../biotech/joburl";

// Tailoring scrapes a job page and calls a model; allow time on hosts that cap it.
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Software for fintech",
  description:
    "Computer science student building blockchain systems, data pipelines, and automation for finance: projects, current work, and contact.",
};

export default async function FintechPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  // /fintech?v=<job url> tailors the page; any failure falls back to `content`.
  const jobUrl = jobUrlFromParams(sp);
  const c = jobUrl ? await tailorIfRequested(content, jobUrl, "fintech") : content;

  return (
    <PortfolioView
      c={c}
      motion={first(sp.motion)}
      variant="fin"
      field={<MarketField />}
      background={<ChartField />}
    />
  );
}