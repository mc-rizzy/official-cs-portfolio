import Link from "next/link";
import ArticleShell from "./articleshell";
import ArticleRow from "./articlerow";
import { articles } from "./data";

/* Shown when an article id does not exist. */
export default function NotFoundPage() {
  return (
    <ArticleShell>
      <main>
        <header className="wrap art-index-head">
          <h1>Article not found</h1>
          <p>
            That link points to an article that does not exist here. It may have been renamed or
            never published. The rest of the collection is below.
          </p>
          <p>
            <Link href="/articles" className="ulink">Back to all articles</Link>
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