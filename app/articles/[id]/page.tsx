import { notFound } from "next/navigation";
import type { ArticleData } from "../types";
import ArticlePage from "./article";

/* ------------------------------------------------------------------ */
/*  ArticleIdPage — renders a single article by id.                  */
/*                                                                    */
/*  The id comes from the URL path segment. We resolve the article   */
/*  data server-side; if it cannot be found we render the not-found  */
/*  page (articles/not-found.tsx) instead of throwing a hard error.  */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return [];
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (params as unknown as { id: string }).id;
  const title =
    id === "volition-neural-control"
      ? "From brainwaves to robotic hands"
      : id === "neural-signal-pipeline"
        ? "Turning raw recordings into a research dataset"
        : id === "autism-motor-analysis"
          ? "Quantifying motor signatures across cohorts"
          : "Article";

  return {
    title,
    description: "How I built an EEG-to-prosthetic control interface — turning raw neural signals into a graph-neural-network model that drives a robotic hand.",
  };
}

export default async function ArticleIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (params as unknown as { id: string }).id;

  if (!id) {
    notFound();
  }

  let article: ArticleData | null = null;
  try {
    const res = await fetch(`/articles/${id}.json`);
    if (!res.ok) {
      notFound();
    }
    article = (await res.json()) as ArticleData;
  } catch {
    notFound();
  }

  return <ArticlePage article={article} id={id} />;
}
