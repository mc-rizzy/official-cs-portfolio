import type { Metadata } from "next";
import ArticleShell from "./articleshell";
import ArticleRow from "./articlerow";
import { articles } from "./data";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Write-ups of what I built and how I worked through it: neural decoding, data pipelines, blockchain, and personal finance software.",
};

export default function ArticlesPage() {
  return (
    <ArticleShell>
      <main>
        <header className="wrap art-index-head">
          <h1>Articles</h1>
          <p>
            Write-ups of what I built and how I worked through it, including the parts that did not
            go to plan.
          </p>
        </header>
        <div className="wrap art-list">
          {articles.map((a) => (
            <ArticleRow key={a.id} a={a} />
          ))}
        </div>
      </main>
    </ArticleShell>
  );
}