import { Metadata } from "next";
import Link from "next/link";

const articles = [
  {
    id: "volition-neural-control",
    title: "From brainwaves to robotic hands",
    subtitle:
      "How I built an EEG-to-prosthetic control interface — turning raw neural signals into a graph-neural-network model that drives a robotic hand.",
    tags: ["Neuroscience", "Robotics", "GNN", "EEG", "PyTorch"],
  },
  {
    id: "neural-signal-pipeline",
    title: "Turning raw recordings into a research dataset",
    subtitle:
      "The messy-to-production data work that powers reliable biotech models — cleaning, annotating, and validating neural recordings end to end.",
    tags: ["Signal Processing", "Data Pipeline", "PyTorch", "SQL"],
  },
  {
    id: "autism-motor-analysis",
    title: "Quantifying motor signatures across cohorts",
    subtitle:
      "Turning clinical observations into a structured, reproducible dataset for downstream ML classification.",
    tags: ["Signal Processing", "ML", "Clinical Data", "Python"],
  },
];

export function generateStaticParams() {
  return articles.map((article) => ({ id: article.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return {
    title: "Articles",
    description: "A collection of long-form pieces on biotech research, data pipelines, and neural systems.",
  };
}

export default async function ArticlesPage() {
  return (
    <section className="articles-index">
      <header className="articles-index-head">
        <p className="articles-index-kicker">Long-form writing</p>
        <h1 className="articles-index-title">Articles</h1>
        <p className="articles-index-lede">
          Long-form pieces on biotech research, data pipelines, and neural
          systems.
        </p>
      </header>

      <ol className="articles-index-list">
        {articles.map((article) => (
          <li key={article.id} className="articles-index-card">
            <Link href={`/articles/${article.id}`} className="articles-index-card-link">
              <div className="articles-index-card-media" />
              <div className="articles-index-card-body">
                <div className="articles-index-card-meta">
                  {article.tags.map((tag) => (
                    <span key={tag} className="articles-index-tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="articles-index-card-title">{article.title}</h2>
                <p className="articles-index-card-sub">{article.subtitle}</p>
                <span className="articles-index-card-arrow">
                  Read the article →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
