import type { Metadata } from "next";
import Link from "next/link";
import "./biotech.css";
import SignalField from "./signalfield";
import NeuralField from "./neuralfield";
import PageEffects from "./PageEffects";
import ContactCard from "./ContactCard";
import { content } from "./content";
import { applyLens, resolveLens } from "./tailor";

export const metadata: Metadata = {
  title: "Software for biotech",
  description:
    "Computer science student building ML models and data pipelines for neural and clinical data: projects, current work, and contact.",
};

const LEVEL_LABEL = { 3: "daily use", 2: "working knowledge", 1: "familiar" } as const;
const STATE_LABEL = { done: "Done", active: "In progress", planned: "Planned" } as const;

const vars = (v: Record<string, number>) => v as unknown as React.CSSProperties;

export default async function BiotechPage({
  searchParams,
}: {
  searchParams: Promise<{ for?: string; motion?: string }>;
}) {
  const { for: lensKey, motion } = await searchParams;
  const c = applyLens(content, resolveLens(lensKey));
  const { profile, current, projects, skills, background, contact } = c;

  return (
    <div className="bio" data-motion={motion}>
      <NeuralField />
      <PageEffects />

      <header className="top">
        <div className="wrap top-in">
          <a href="#top" className="top-name">{profile.name}</a>
          <nav className="top-nav" aria-label="Sections">
            <a href="#current">Current work</a>
            <a href="#projects">Projects</a>
            <a href="#skills">Skills</a>
            <a href="#background">Background</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
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
          {profile.facts.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <main>
        <section className="sec" id="current" data-reveal>
          <div className="wrap sec-grid">
            <h2>Current work</h2>
            <div className="plate">
              <span className="status">{current.status}</span>
              <h3>{current.title}</h3>
              <p>{current.summary}</p>
              <ol className="steps">
                {current.milestones.map((m, i) => (
                  <li key={m.label} data-state={m.state} style={vars({ "--i": i })}>
                    <span>{m.label}</span>
                    <span className="state">{STATE_LABEL[m.state]}</span>
                  </li>
                ))}
              </ol>
              {current.links && (
                <p className="plate-links">
                  {current.links.map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="ulink">
                      {l.label}
                    </a>
                  ))}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="sec" id="projects" data-reveal>
          <div className="wrap sec-grid">
            <h2>Projects</h2>
            <div>
              {projects.map((p) => (
                <article className="proj" key={p.id}>
                  <div className="proj-meta">
                    <div>{p.kind}</div>
                    {p.stage && <div>{p.stage}</div>}
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
                        <Link href={`/articles/${p.articleId}`} className="proj-link ulink">
                          Write-up
                        </Link>
                      )}
                      {p.links?.map((l) => (
                        <a
                          key={l.url}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="proj-link ulink"
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

        <section className="sec" id="skills" data-reveal>
          <div className="wrap sec-grid">
            <h2>Skills</h2>
            <div>
              <dl>
                {skills.map((g, gi) => (
                  <div className="skill-row" key={g.group} style={vars({ "--g": gi })}>
                    <dt>{g.group}</dt>
                    <dd>
                      <ul className="skill-list">
                        {g.items.map((s) => (
                          <li className="skill" data-focus={!!s.focus} key={s.name}>
                            {s.name}
                            <span className="meter" aria-hidden="true">
                              {[1, 2, 3].map((n) => (
                                <i key={n} className={n <= s.level ? "on" : ""} style={vars({ "--n": n })} />
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

        <section className="sec" id="background" data-reveal>
          <div className="wrap sec-grid">
            <h2>Background</h2>
            <div>
              {background.map((b) => (
                <div className="bg-row" key={b.org}>
                  <div className="proj-meta">{b.kind}</div>
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

        <section className="sec" id="contact" data-reveal>
          <div className="wrap sec-grid">
            <h2>Contact</h2>
            <ContactCard name={profile.name} blurb={contact.blurb} links={contact.links} />
          </div>
        </section>
      </main>

      <footer className="wrap foot">
        <span>{profile.name}</span>
        <span>{profile.role}</span>
      </footer>
    </div>
  );
}