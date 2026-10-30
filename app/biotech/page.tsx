import type { Metadata } from "next";
import Link from "next/link";
import "./biotech.css";
import SignalField from "./Signalfield";
import { content } from "./Content";
import { applyLens, resolveLens } from "./tailor";

export const metadata: Metadata = {
  title: "Neural engineering",
  description:
    "EEG decoding, graph neural networks, and assistive robotics: projects, current work, and contact.",
};

const LEVEL_LABEL = { 3: "daily use", 2: "working knowledge", 1: "familiar" } as const;
const STATE_LABEL = { done: "Done", active: "In progress", planned: "Planned" } as const;

export default async function BiotechPage({
  searchParams,
}: {
  searchParams: Promise<{ for?: string }>;
}) {
  const { for: lensKey } = await searchParams;
  const c = applyLens(content, resolveLens(lensKey));
  const { profile, current, projects, skills, background, contact } = c;

  return (
    <div className="bio">
      <header className="top wrap">
        <a href="#top" className="top-name">{profile.name}</a>
        <nav className="top-nav" aria-label="Sections">
          <a href="#current">Current work</a>
          <a href="#projects">Projects</a>
          <a href="#skills">Skills</a>
          <a href="#background">Background</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="wrap hero-text">
          <h1>{profile.headline}</h1>
          <p className="hero-sub">{profile.summary}</p>
        </div>

        <div className="field">
          <SignalField />
        </div>

        <dl className="wrap facts">
          <div><dt>Focus</dt><dd>{profile.focus}</dd></div>
          <div><dt>Affiliation</dt><dd>{profile.affiliation}</dd></div>
          <div><dt>Location</dt><dd>{profile.location}</dd></div>
          <div><dt>Status</dt><dd>{profile.status}</dd></div>
        </dl>
      </section>

      <main>
        <section className="sec" id="current">
          <div className="wrap sec-grid">
            <h2>Current work</h2>
            <div className="plate">
              <span className="status">{current.status}</span>
              <h3>{current.title}</h3>
              <p>{current.summary}</p>
              <ol className="steps">
                {current.milestones.map((m) => (
                  <li key={m.label} data-state={m.state}>
                    <span>{m.label}</span>
                    <span className="state">{STATE_LABEL[m.state]}</span>
                  </li>
                ))}
              </ol>
              {current.links && (
                <p className="plate-links">
                  {current.links.map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">
                      {l.label}
                    </a>
                  ))}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="sec" id="projects">
          <div className="wrap sec-grid">
            <h2>Projects</h2>
            <div>
              {projects.map((p) => (
                <article className="proj" key={p.id}>
                  <div className="proj-meta">
                    <div>{p.kind}</div>
                    {p.period && <div>{p.period}</div>}
                  </div>
                  <div>
                    <h3>{p.title}</h3>
                    {p.role && <p className="proj-role">{p.role}</p>}
                    <p>{p.summary}</p>
                    {p.outcome && (
                      <p>
                        <strong>Result.</strong> {p.outcome}
                      </p>
                    )}
                    <div className="proj-foot">
                      <span className="proj-tags">{p.tags.join(", ")}</span>
                      {p.articleId && (
                        <Link href={`/articles/${p.articleId}`} className="proj-link">
                          Write-up
                        </Link>
                      )}
                      {p.links?.map((l) => (
                        <a
                          key={l.url}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="proj-link"
                        >
                          {l.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sec" id="skills">
          <div className="wrap sec-grid">
            <h2>Skills</h2>
            <div>
              <dl>
                {skills.map((g) => (
                  <div className="skill-row" key={g.group}>
                    <dt>{g.group}</dt>
                    <dd>
                      <ul className="skill-list">
                        {g.items.map((s) => (
                          <li className="skill" data-focus={!!s.focus} key={s.name}>
                            {s.name}
                            <span className="meter" aria-hidden="true">
                              {[1, 2, 3].map((n) => (
                                <i key={n} className={n <= s.level ? "on" : ""} />
                              ))}
                            </span>
                            <span className="sr">{LEVEL_LABEL[s.level]}</span>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="legend">Bars show daily use, working knowledge, or familiarity.</p>
            </div>
          </div>
        </section>

        <section className="sec" id="background">
          <div className="wrap sec-grid">
            <h2>Background</h2>
            <div>
              {background.map((b) => (
                <div className="bg-row" key={b.org}>
                  <div className="proj-meta">{b.period}</div>
                  <div>
                    <h3>{b.org}</h3>
                    <p className="proj-role">{b.role}</p>
                    {b.note && <p>{b.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sec" id="contact">
          <div className="wrap sec-grid">
            <h2>Contact</h2>
            <div className="card">
              <h3>{profile.name}</h3>
              <p>{contact.blurb}</p>
              <dl className="card-rows">
                <div>
                  <dt>Email</dt>
                  <dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd>
                </div>
                {contact.links.map((l) => (
                  <div key={l.url}>
                    <dt>{l.label}</dt>
                    <dd>
                      <a href={l.url} target="_blank" rel="noopener noreferrer">
                        {l.url.replace(/^https?:\/\//, "")}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      </main>

      <footer className="wrap foot">
        <span>{profile.name}</span>
        <span>{new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}