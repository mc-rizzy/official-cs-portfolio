import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articles, getArticle } from "../data";
import ArticleView from "../articleview";

/* Articles come from ../data.ts, so every page is generated at build time.
   Unknown ids fall through to ../not-found.tsx. */
export function generateStaticParams() {
  return articles.map((a) => ({ id: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = getArticle(id);
  if (!article) return { title: "Article not found" };
  return { title: article.title, description: article.subtitle };
}

export default async function ArticleIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = getArticle(id);
  if (!article) notFound();
  return <ArticleView article={article} />;
}