import Link from "next/link";

/*
  Route: /articles/not-found

  Shown when an article id cannot be resolved. Instead of a hard error it
  offers a friendly message plus a list of the real articles to browse.
*/

const articles = [
  {
    id: "volition-neural-control",
    title: "From brainwaves to robotic hands",
    subtitle:
      "How I built an EEG-to-prosthetic control interface — turning raw neural signals into a graph-neural-network model that drives a robotic hand.",
  },
  {
    id: "neural-signal-pipeline",
    title: "Turning raw recordings into a research dataset",
    subtitle:
      "The messy-to-production data work that powers reliable biotech models — cleaning, annotating, and validating neural recordings end to end.",
  },
  {
    id: "autism-motor-analysis",
    title: "Quantifying motor signatures across cohorts",
    subtitle:
      "Turning clinical observations into a structured, reproducible dataset for downstream ML classification.",
  },
];

export default function NotFoundPage() {
  return (
    <section className="art-notfound">
      <header className="art-notfound-head">
        <p className="art-notfound-code">404</p>
        <h1 className="art-notfound-title">Article not found</h1>
        <p className="art-notfound-lede">
          That link points to an article that doesn't exist here — maybe it was
          renamed, moved, or never published. No worries, the rest of the
          collection is right here.
        </p>
      </header>

      <div className="art-notfound-actions">
        <Link href="/articles" className="art-notfound-back">
          ← Back to all articles
        </Link>
      </div>

      <ol className="art-notfound-list">
        {articles.map((article) => (
          <li key={article.id} className="art-notfound-card">
            <Link href={`/articles/${article.id}`} className="art-notfound-card-title">
              {article.title}
            </Link>
            <p className="art-notfound-card-sub">{article.subtitle}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
