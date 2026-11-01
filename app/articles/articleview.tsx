import Link from "next/link";
import ArticleShell from "./articleshell";
import ArticleEffects from "./articleeffects";
import ArticleRow from "./articlerow";
import SignalField from "../biotech/signalfield";
import MarketField from "../fintech/marketfield";
import { readingTime, relatedTo, type Article, type Block } from "./data";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const vars = (v: Record<string, number>) => v as unknown as React.CSSProperties;

/* **bold**, `code`, and [label](/path) inside text. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith("`") && p.endsWith("`")) return <code key={i}>{p.slice(1, -1)}</code>;
        const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (m) {
          return m[2].startsWith("/") ? (
            <Link key={i} href={m[2]} className="ulink">{m[1]}</Link>
          ) : (
            <a key={i} href={m[2]} target="_blank" rel="noopener noreferrer" className="ulink">{m[1]}</a>
          );
        }
        return p;
      })}
    </>
  );
}

function Fig({ children, caption }: { children: React.ReactNode; caption?: string }) {
  return (
    <figure className="art-fig" data-reveal>
      {children}
      {caption && (
        <figcaption>
          <Inline text={caption} />
        </figcaption>
      )}
    </figure>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.type) {
    case "h2":
      return <h2 id={slug(b.text)}>{b.text}</h2>;

    case "p":
      return (
        <p>
          <Inline text={b.text} />
        </p>
      );

    case "list": {
      const Tag = b.ordered ? "ol" : "ul";
      return (
        <Tag className="art-list-body">
          {b.items.map((it, i) => (
            <li key={i}>
              <Inline text={it} />
            </li>
          ))}
        </Tag>
      );
    }

    case "callout":
      return (
        <aside className="art-callout">
          {b.title && <strong>{b.title}</strong>}
          <p>
            <Inline text={b.text} />
          </p>
        </aside>
      );

    case "flow":
      return (
        <Fig caption={b.caption}>
          <ol className="art-flow">
            {b.steps.map((s, i) => (
              <li key={s.title} style={vars({ "--i": i })}>
                <span className="art-flow-title">{s.title}</span>
                {s.note && <span className="art-flow-note">{s.note}</span>}
              </li>
            ))}
          </ol>
        </Fig>
      );

    case "bars": {
      const max = b.max ?? 100;
      return (
        <Fig caption={b.caption}>
          <div className="art-bars">
            {b.items.map((it, i) => (
              <div className="art-bar" key={it.label} style={vars({ "--i": i })}>
                <span className="lbl">{it.label}</span>
                <span className="track">
                  <i style={vars({ "--v": Math.min(1, it.value / max) })} />
                </span>
                <span className="val">
                  {it.value}
                  {b.unit}
                </span>
                {it.note && <span className="note">{it.note}</span>}
              </div>
            ))}
          </div>
        </Fig>
      );
    }

    case "stats":
      return (
        <div className="art-stats">
          {b.items.map((s) => (
            <div className="art-stat" key={s.num}>
              <b>{s.num}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      );

    case "code":
      return (
        <figure className="art-code">
          <pre>
            <code>{b.code}</code>
          </pre>
          {b.caption && (
            <figcaption>
              <Inline text={b.caption} />
            </figcaption>
          )}
        </figure>
      );

    case "table":
      return (
        <figure className="art-table">
          <div className="art-table-scroll">
            <table>
              <thead>
                <tr>
                  {b.head.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (
                      <td key={j}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {b.caption && <figcaption>{b.caption}</figcaption>}
        </figure>
      );
  }
}

export default function ArticleView({ article }: { article: Article }) {
  const toc = article.blocks
    .filter((b): b is Extract<Block, { type: "h2" }> => b.type === "h2")
    .map((b) => ({ id: slug(b.text), text: b.text }));
  const related = relatedTo(article.id);
  const contactHref = article.theme === "fintech" ? "/fintech#contact" : "/biotech#contact";

  return (
    <ArticleShell theme={article.theme} progress>
      <ArticleEffects />

      <section className="art-hero">
        <div className="wrap art-hero-text">
          <Link href="/articles" className="art-back ulink">All articles</Link>
          <h1>{article.title}</h1>
          <p className="art-sub">{article.subtitle}</p>
          <div className="art-meta">
            <span>{article.category}</span>
            <span>{readingTime(article)} min read</span>
            <span>{article.tags.join(", ")}</span>
          </div>
        </div>
        <div className="art-field">{article.theme === "fintech" ? <MarketField /> : <SignalField />}</div>
      </section>

      <div className="wrap art-layout">
        <aside className="art-aside">
          <nav className="toc" aria-label="On this page">
            <p className="toc-title">On this page</p>
            <ol>
              {toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`}>{t.text}</a>
                </li>
              ))}
            </ol>
          </nav>
          {(article.githubUrl || article.liveUrl) && (
            <div className="art-aside-links">
              {article.githubUrl && (
                <a href={article.githubUrl} target="_blank" rel="noopener noreferrer" className="ulink">
                  View the code
                </a>
              )}
              {article.liveUrl && (
                <Link href={article.liveUrl.url} className="ulink">
                  {article.liveUrl.label}
                </Link>
              )}
            </div>
          )}
        </aside>

        <article className="art-prose">
          <p className="art-lede">{article.intro}</p>
          {article.blocks.map((b, i) => (
            <BlockView key={i} b={b} />
          ))}
        </article>
      </div>

      <section className="art-end">
        <div className="wrap">
          <h2>Keep reading</h2>
          <div className="art-list">
            {related.map((a) => (
              <ArticleRow key={a.id} a={a} />
            ))}
          </div>
          <p className="art-end-cta">
            Questions about this work? <Link href={contactHref} className="ulink">Get in touch</Link>.
          </p>
        </div>
      </section>
    </ArticleShell>
  );
}