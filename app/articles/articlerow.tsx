import Link from "next/link";
import { readingTime, type Article } from "./data";

/* One article in a list: index, related links, and the 404 page. */
export default function ArticleRow({ a }: { a: Article }) {
  return (
    <Link href={`/articles/${a.id}`} className="art-row" data-theme={a.theme}>
      <div className="art-row-meta">
        <div>{a.category}</div>
        <div>{readingTime(a)} min read</div>
      </div>
      <div>
        <h3>{a.title}</h3>
        <p>{a.subtitle}</p>
        <span className="art-row-tags">{a.tags.join(", ")}</span>
      </div>
    </Link>
  );
}